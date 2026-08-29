import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const showApiToken = sdk.Action.withoutInput(
  'show-api-token',
  async () => ({
    name: i18n('Show API Token'),
    description: i18n(
      'Display the bearer token required by the scenes API (the /api path of the Web UI address).',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const apiToken = await storeJson.read((s) => s.apiToken).once()

    return {
      version: '1',
      title: i18n('Scenes API Credentials'),
      message: i18n(
        'Send this token as "Authorization: Bearer <token>" on every API request. The API lives at the /api path of the Web UI address.',
      ),
      result: {
        type: 'single',
        name: i18n('API Token'),
        description: null,
        value: apiToken ?? i18n('Not generated yet — restart the service'),
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
