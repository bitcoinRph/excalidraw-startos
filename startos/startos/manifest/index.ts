import { setupManifest } from '@start9labs/start-sdk'
import { short, long } from './i18n'

export const manifest = setupManifest({
  id: 'excalidraw',
  title: 'Excalidraw',
  license: 'MIT',
  wrapperRepo: 'https://github.com/bitcoinRph/excalidraw-startos',
  upstreamRepo: 'https://github.com/excalidraw/excalidraw',
  supportSite: 'https://github.com/excalidraw/excalidraw/issues',
  marketingSite: 'https://excalidraw.com/',
  donationUrl: 'https://opencollective.com/excalidraw',
  docsUrl: 'https://docs.excalidraw.com/',
  description: { short, long },
  volumes: ['main'],
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
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
