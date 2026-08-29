import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const rotateApiToken = sdk.Action.withoutInput(
  'rotate-api-token',
  async () => ({
    name: i18n('Rotate API Token'),
    description: i18n('Generate a new bearer token for the scenes API.'),
    warning: i18n(
      'The current token stops working immediately. The API restarts to pick up the new token.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const apiToken = utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 48 })
    await storeJson.merge(effects, { apiToken })

    return {
      version: '1',
      title: i18n('New Scenes API Token'),
      message: i18n(
        'Send this token as "Authorization: Bearer <token>" on every API request. The previous token is no longer valid.',
      ),
      result: {
        type: 'single',
        name: i18n('API Token'),
        description: null,
        value: apiToken,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
