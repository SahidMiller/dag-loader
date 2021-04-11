# dag-loader
> Load whole directories and files as dag nodes

## Usage

#### Install

```bash
npm install --save dag-loader
```

#### Webpack configurations

**In module**
```javascript
const dagNode = require('!dag-loader!@ipfs-project/package')

// Add runtime data to build-time dag node
dagNode.addLink(new DAGLink("data.json", dataJson.size, dataJson.cid))

// Remove build-time links explicity to override with runtime info
dagNode.rmLink("index.html")
dagNode.addLink(new DAGLink("index.html", indexPage.size, indexPage.cid))

// Publish updated dagNode
const info = await ipfs.dag.put(dagNode, { format: 'dag-pb', hashAlg: 'sha2-256' })

// Share result with the user or backend
const cid = new CID(info.multihash).toBaseEncodedString()

// Double check you can get the new node
await ipfs.dag.get(cid)
```


**In package**

dag-loader requires a target configuration file with information on files to convert. 

```javascript
module.exports = {
  files: {
    root: './dist',
    globs: [
      /* Make sure that files matched can be handled by your webpack loaders */
      '**/*'
    ]
  }
};
```