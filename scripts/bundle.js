const { join } = require('path')
const AdmZip = require('adm-zip')
const fs = require('fs-extra')
const { promisify } = require('util')

function generateInfo() {
  return {
    identifier: 'dev.icong1993.bob-plugin-deeplx',
    category: 'translate',
    name: 'DeepL Translate',
    summary: '',
    icon: '115',
    author: 'icong1993',
    homepage: 'https://github.com/icong1993/bob-plugin-deeplx.git',
    appcast:
      'https://github.com/icong1993/bob-plugin-deeplx/raw/master/appcast.json',
    minBobVersion: '0.5.0',
    options: [
      {
        identifier: 'api',
        type: 'text',
        title: 'API endpoint',
      },
      // {
      //   identifier: 'cache',
      //   type: 'menu',
      //   title: 'Cache',
      //   defaultValue: 'false',
      //   menuValues: [
      //     {
      //       title: 'False',
      //       value: 'false',
      //     },
      //     {
      //       title: 'True',
      //       value: 'true',
      //     },
      //   ],
      // },
    ],
  }
}

async function main() {
  const pkgName = 'bob-plugin-deeplx'
  const version = require('../package.json').version
  const buildDir = join(__dirname, '../build')
  const releaseDir = join(__dirname, '../release')
  const pkg = join(releaseDir, `${pkgName}.bobplugin`)
  const info = {
    ...generateInfo(),
    version,
  }

  await fs.writeJson(join(buildDir, 'info.json'), info)

  const zip = new AdmZip()
  zip.addLocalFolder(buildDir)
  await promisify(zip.writeZip)(pkg)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
