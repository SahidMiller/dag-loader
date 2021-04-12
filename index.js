const load = require('./src/dag-loader');
const path = require('path')
const Module = require('module')
const parent = module;

module.exports = async function dagLoader(source, map, meta) {
  this.cacheable();
  const callback = this.async();
  try {
    
    const config = execute(source, this)
    const root = path.resolve(this.context, config.files.root)

    const dagNode = await load(config.files.globs, { cwd: root })
    
    this.addContextDependency(root);

    this.resolve(this.context, "ipld-dag-pb", (err) => {
      if (err) callback(err)
    })

    this.resolve(this.context, "buffer", (err) => {
      if (err) callback(err)
    })
    
    const base64Serialized = dagNode.serialize().toString('base64')
    callback(null, `
      const { util } = require("ipld-dag-pb"); 
      const { Buffer } = require("buffer"); 
      module.exports = util.deserialize(
        Buffer.from(\`${base64Serialized}\`, 'base64')
      );
    `, map, meta)
  
  } catch(err) {
    callback(err)
  }
};

//Based on webpack-contrib/val-loader
//Using build-time config and assets and exporting dagnode-ified version, God willing.
function execute(code, loaderContext) {
    const module = new Module(loaderContext.resource, parent);
  
    // eslint-disable-next-line no-underscore-dangle
    module.paths = Module._nodeModulePaths(loaderContext.context);
    module.filename = loaderContext.resource;
  
    // eslint-disable-next-line no-underscore-dangle
    module._compile(code, loaderContext.resource);
  
    return module.exports;
}