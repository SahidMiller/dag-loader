'use strict';

const IPLD = require('ipld')
const inMemory = require('ipld-in-memory')
const { DAGNode, DAGLink } = require('ipld-dag-pb')

const { importer } = require('ipfs-unixfs-importer')
const { UnixFS } = require('ipfs-unixfs')

const glob = require('glob-all')
const path = require('path')
const fs = require('fs');

const toDagNodeDirectory = (links) => {
	const dir = new UnixFS({ type: 'directory' }).marshal();
	return new DAGNode(dir, links)
}

const hashData = async (files, options) => {
  options = options || {}
  options.onlyHash = true

  const ipld = await inMemory(IPLD)

  const links = []
  for await (const result of importer(files, ipld, options)) {
    if (result.path.indexOf("/") === -1) {
      links.push(new DAGLink(result.path, result.size, result.cid))
    }
  }

  return toDagNodeDirectory(links)
}

async function readDir(globs, options = {}) {
  return await new Promise((resolve, reject) => {
    glob(globs, options, (err, paths) => {
      if (err) {
        reject(err);
      } else {
        resolve(paths);
      }
    });
  });
}

module.exports = async function (globs, globOptions) {
  // TODO God willing get dag node of all files in directory
  const { cwd } = globOptions
  const paths = await readDir(globs, globOptions)
  const files = paths.map(relative => {
    const absolute = path.resolve(cwd, relative)
    return { relative, absolute }
  }).filter((path) => {
    return !fs.lstatSync(path.absolute).isDirectory()
  }).map(path => {
    return { path: path.relative, content: fs.readFileSync(path.absolute) }
  })

  return await hashData(files, { wrap: true, wrapWithDirectory: true })
}