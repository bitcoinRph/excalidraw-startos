import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: 80,
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n('The web interface of Excalidraw'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const uiReceipt = await uiMultiOrigin.export([ui])

  const apiMulti = sdk.MultiHost.of(effects, 'api-multi')
  const apiMultiOrigin = await apiMulti.bindPort(apiPort, {
    protocol: 'http',
    preferredExternalPort: apiPort,
  })
  // Dedicated CLI/script interface. It serves the same API daemon directly;
  // the UI still reaches it through nginx at /api for same-origin browser use.
  const api = sdk.createInterface(effects, {
    name: i18n('Scenes API'),
    id: 'api',
    description: i18n(
      'REST API for saving and loading .excalidraw scenes. Requires the bearer token from the Show API Token action.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const apiReceipt = await apiMultiOrigin.export([api])

  return [uiReceipt, apiReceipt]
})
