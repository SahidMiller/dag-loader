const fs = require('fs')
const glob = require('glob-all')
const path = require('path')

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

module.exports = async function getFiles(globs, globOptions) {
  // TODO God willing get dag node of all files in directory
  const { cwd } = globOptions
  const paths = await readDir(globs, globOptions)
  const files = paths.map(relative => {
    const absolute = path.resolve(cwd, relative)
    return { relative, absolute }
  }).filter((path) => {
    return !fs.lstatSync(path.absolute).isDirectory()
  }).map(path => {
    return { path: path.relative, absolute: path.absolute, content: fs.readFileSync(path.absolute) }
  })

  return files
}