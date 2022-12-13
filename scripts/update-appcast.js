const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')

const pkg = require('../package.json')
const plugAppcast = require('../appcast.json')
const githubRelease = `https://github.com/zcong1993/bob-plugin-deeplx/releases/download`

function main() {
  const pkgName = 'bob-plugin-deeplx'
  const pkgPath = path.join(__dirname, `../release/${pkgName}.bobplugin`)
  const appcastPath = path.join(__dirname, '../appcast.json')

  const fileBuffer = fs.readFileSync(pkgPath)
  const sum = crypto.createHash('sha256')
  sum.update(fileBuffer)
  const hex = sum.digest('hex')

  const version = {
    version: pkg.version,
    desc:
      'https://github.com/zcong1993/bob-plugin-deeplx/releases/tag/v' +
      pkg.version,
    sha256: hex,
    url: `${githubRelease}/v${pkg.version}/${pkgName}.bobplugin`,
    minBobVersion: '0.5.0',
  }

  let versions = (plugAppcast && plugAppcast.versions) || []

  if (!Array.isArray(versions)) versions = []

  const index = versions.findIndex((v) => v.version === pkg.version)

  if (index === -1) {
    versions.splice(0, 0, version)
  } else {
    versions.splice(index, 1, version)
  }

  const appcastData = {
    identifier: 'dev.zcong1993.bob-plugin-deeplx',
    versions,
  }

  fs.outputJSONSync(appcastPath, appcastData, { spaces: 2 })
}

main()
