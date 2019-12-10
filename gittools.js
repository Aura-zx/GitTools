const {
  readdirSync, lstatSync, writeFile, appendFile,
} = require('fs')
const { join } = require('path')
const { execSync } = require('child_process')

const cpath = process.cwd()
const excludes = ['.eslintrc.js', 'gittools.js', '.DS_Store', 'package.json']

function findAllFilesName(root) {
  const fnames = []
  const findName = path => {
    const files = readdirSync(path)
    files.forEach((name) => {
      const fpath = join(path, name)
      if (excludes.includes(name) === false) {
        if (lstatSync(fpath).isDirectory()) {
          findName(fpath)
        } else {
          fnames.push(fpath)
        }
      }
    })
  }

  findName(root)
  return fnames
}

const fnames = findAllFilesName(cpath)

function getStatsByAuthor(info) {
  const stats = {}
  const lines = info.toString().split('\n')
    .map(line => line.trim())
    .filter(line => line.trim() !== '')
    .filter(line => { return line.startsWith('Author') || line.startsWith('1 file changed') })
    .map((line, index) => (index % 2 === 0 ? line.split(':') : line.split(',')))
    .map((line, index, arrs) => (index % 2 === 0 ? [...line, ...arrs[index + 1]] : []))
    .filter(line => line.length !== 0)

  lines.forEach(line => {
    const author = line[1].trim()
    let ins = 0
    let del = 0
    if (line.length === 4) {
      if (line[3].trim().includes('+')) {
        ins = parseInt(line[3].trim().split(' ')[0], 10)
      } else if (line[3].trim().includes('-')) {
        del = parseInt(line[3].trim().split(' ')[0], 10)
      }
    }
    if (line.length === 5) {
      ins = parseInt(line[3].trim().split(' ')[0], 10)
      del = parseInt(line[4].trim().split(' ')[0], 10)
    }
    if (stats.hasOwnProperty(author) === false) {
      stats[author] = { ins, del }
    } else {
      stats[author].ins += ins
      stats[author].del += del
    }
  })

  const statsArr = Object.keys(stats).map(key => { return { [key]: stats[key] } }).sort((stat1, stat2) => {
    const author1 = Object.keys(stat1)[0]
    const author2 = Object.keys(stat2)[0]
    const contribute = (stat1[author1].ins + stat1[author1].del) - (stat2[author2].ins + stat2[author2].del)
    if (contribute < 0) {
      return 1
    }
    if (contribute > 0) {
      return -1
    }
    return 0
  })

  return statsArr
}

writeFile(`${__dirname}/ststs.txt`, Buffer.from('start\\n', 'utf-8'), (err) => {
  if (err) {
    console.log('写入文件错误', err)
  }
})

const groupByDir = {}
let i = 0
fnames.forEach(fname => {
  const stdout = execSync(`git log --follow --shortstat ${fname}`)
  const stats = getStatsByAuthor(stdout)
  const fpaths = fname.split('/').reverse()
  const fileStats = {
    file: `${fpaths[1]}/${fpaths[0]}`,
    data: stats,
  }

  if (Object.keys(groupByDir).includes(fpaths[1])) {
    // groupByDir[fpaths[1]] = stats
  }

  appendFile(`${__dirname}/ststs.txt`, `${JSON.stringify(fileStats)}\n`, (err) => {
    if (err) {
      console.log('追加写入文件错误', err)
    }
  })
  console.log(i++)
})