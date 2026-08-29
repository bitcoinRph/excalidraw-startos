import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting Excalidraw!'))

  // restarts the api daemon whenever the token is rotated
  const apiToken = await storeJson.read((s) => s.apiToken).const(effects)

  /**
   * ======================== Daemons ========================
   *
   * Excalidraw itself is a static web app served by nginx; drawings live
   * client-side in the browser. The scenes API sidecar (startos/api/server.mjs)
   * adds optional server-side scene storage on the main volume, proxied by
   * nginx at /api. Both daemons share one subcontainer, so nginx reaches the
   * API on localhost.
   */
  const container = sdk.SubContainer.of(
    effects,
    { imageId: 'excalidraw' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'excalidraw-sub',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('api', {
      subcontainer: container,
      exec: {
        command: ['node', '/usr/lib/excalidraw-api/server.mjs'],
        env: {
          EXCALIDRAW_API_TOKEN: apiToken ?? '',
          EXCALIDRAW_API_PORT: String(apiPort),
          EXCALIDRAW_API_DATA: '/data/scenes',
        },
      },
      ready: {
        display: i18n('Scenes API'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, apiPort, {
            successMessage: i18n('The scenes API is ready'),
            errorMessage: i18n('The scenes API is not ready'),
          }),
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: container,
      exec: { command: ['nginx', '-g', 'daemon off;'] },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['api'],
    })
})
