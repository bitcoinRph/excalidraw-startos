import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'excalidraw',
  title: 'Excalidraw',
  license: 'MIT',
  packageRepo: 'https://github.com/bitcoinRph/excalidraw-startos',
  upstreamRepo: 'https://github.com/excalidraw/excalidraw',
  marketingUrl: 'https://excalidraw.com/',
  donationUrl: 'https://opencollective.com/excalidraw',
  description: { short, long },
  // 'startos' holds package-generated state (store.json with the API token)
  // and is never mounted into a subcontainer
  volumes: ['main', 'startos'],
  images: {
    excalidraw: {
      source: {
        dockerBuild: {
          workdir: '..',
          dockerfile: '../Dockerfile',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
