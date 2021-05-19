const path = require('path');
const fs = require('fs');

const { hashDirectory, hashFile } = require('./src/dag-loader');
const getFiles = require('./src/get-files')

module.exports = async function dagLoader(source, map, meta) {
  this.cacheable();

  const callback = this.async();

  try {

    const config = this.getOptions()
    
    let serialized
    
    if (!config.path && !this.context) {
      throw new Error("path option or file context required")
    }

    //Handle if file is passed in with glob or path or just path w/ or w/o glob
    if (config.path || (this.context && config.glob)) {
      const root = config.path && path.isAbsolute(config.path) ? 
        config.path : 
        //Handle if file passed in with path (for w.e reason) relative to context
        //Handle if no file passed in with path relative to rootContext
        path.resolve(this.context || this.rootContext, config.path || "")
      
      const files = await getFiles(config.glob || "**/*", { cwd: root })
      
      const node = await hashDirectory(files)
      serialized = await node.toDAGLink()
    } else {
      
      //TODO God willing: handle specific file with and maybe without glob pattern, God willing.
      const node = await hashFile({ absolute: this.resourcePath, path: this.resourcePath, content: fs.readFileSync(this.resourcePath) })
      serialized = await node.toDAGLink()
    }
    
    const node = { cid: serialized.Hash.toBaseEncodedString(), links: serialized.links, size: serialized.size }
        
    callback(null, `module.exports = ${ JSON.stringify(node, null, 2) }`, map, meta)

  } catch (err) {
      callback(err)
  }
};