import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

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
  // Same origin as the UI (nginx proxies /api to the sidecar), surfaced as a
  // copyable base URL. Requests need "Authorization: Bearer <token>" — see the
  // Show API Token action.
  const api = sdk.createInterface(effects, {
    name: i18n('Scenes API'),
    id: 'api',
    description: i18n(
      'REST API for saving and loading .excalidraw scenes. Requires the bearer token from the Show API Token action.',
    ),
    type: 'api',
    masked: true,
    schemeOverride: null,
    username: null,
    path: '/api',
    query: {},
  })

  const uiReceipt = await uiMultiOrigin.export([ui, api])

  return [uiReceipt]
})
