'use strict';

const { UnixFS } = require('ipfs-unixfs');
const { importer } = require('ipfs-unixfs-importer')

const IPLD = require('ipld')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const inMemory = require('ipld-in-memory')

module.exports = {
  hashDirectory: async (files, options) => {
    options = options || {}
    options.onlyHash = true
    options.wrap = true
    options.wrapWithDirectory = true

    const ipld = await inMemory(IPLD)

    const links = []
    for await (const result of importer(files, ipld, options)) {
      
      //Remove wrapping directory
      if (result.path.indexOf("/") === -1 && result.path ) { 
        links.push(new DAGLink(result.path, result.size, result.cid))
      }
    }

    const dir = new UnixFS({ type: 'directory' }).marshal();
    return new DAGNode(dir, links)  
  },
  hashFile: async (file, options) => {
    options = options || {}
    options.onlyHash = true
    options.wrap = false
    options.wrapWithDirectory = false

    const ipld = await inMemory(IPLD)

    for await (const result of importer([file], ipld, options)) {
      const data = result.unixfs.marshal();
      return new DAGNode(data, [])  
    }
  }
}