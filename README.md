# dag-loader
> Load whole directories and files as dag nodes

## Usage

#### Install

```bash
npm install -D dag-loader
```

#### Webpack configurations

**In module**
```javascript

//Import a directory as a DAG Node
const dagNode = require('!dag-loader!@ipfs-project/package')

// Create runtime dag nodes/links (using user data) to attach to build-time dag node
const dataJsonString = JSON.stringify({}, null, 2)
const indexHtmlString = mustache.render("", {});

// Upload runtime nodes to IPFS to get links
// (skip if you already have { hash, size, and name } that you intend to link)
const dataJsonFile = new DAGNode(new UnixFS({ type: 'file', data: dataJsonString }).marshal());
const indexPageFile = new DAGNode(new UnixFS({ type: 'file', data: indexHtmlString }).marshal());

const dataJsonUploadInfo = await ipfs.dag.put(dataJsonFile, { format: 'dag-pb', hashAlg: 'sha2-256' })
const indexPageUploadInfo = await ipfs.dag.put(indexPageFile, { format: 'dag-pb', hashAlg: 'sha2-256' })

const dataJsonHash = new CID(dataJsonUploadInfo.multihash).toBaseEncodedString()
const indexPageHash = new CID(indexPageUploadInfo.multihash).toBaseEncodedString()

const dataJson = { Hash: dataJsonHash, Tsize: dataJsonFile.size, Name: "data.json" }
const indexPage = { Hash: dataJsonHash, Tsize: indexPageFile.size, Name: "index.html" }

// Attach runtime dag-nodes to build-time dag-nodes
dagNode.addLink(new DAGLink("data.json", dataJson.size, dataJson.cid))

// (Remove build-time links explicity to override with runtime info)
dagNode.rmLink("index.html")
dagNode.addLink(new DAGLink("index.html", indexPage.size, indexPage.cid))

// Publish the updated dag-node 
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
