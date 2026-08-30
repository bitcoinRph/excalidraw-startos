export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Excalidraw!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of Excalidraw': 5,

  // main.ts (scenes API daemon)
  'Scenes API': 6,
  'The scenes API is ready': 7,
  'The scenes API is not ready': 8,

  // interfaces.ts (scenes API interface)
  'REST API for saving and loading .excalidraw scenes. Requires the bearer token from the Show API Token action.': 9,

  // actions/showApiToken.ts
  'Show API Token': 10,
  'Display the bearer token required by the Scenes API interface.': 11,
  'Scenes API Credentials': 12,
  'Send this token as "Authorization: Bearer ***" on every API request. Use the Scenes API interface address for CLI/script access; the Web UI also proxies the API at /api.': 13,
  'API Token': 14,
  'Not generated yet — restart the service': 15,

  // actions/rotateApiToken.ts
  'Rotate API Token': 16,
  'Generate a new bearer token for the scenes API.': 17,
  'The current token stops working immediately. The API restarts to pick up the new token.': 18,
  'New Scenes API Token': 19,
  'Send this token as "Authorization: Bearer <token>" on every API request. The previous token is no longer valid.': 20,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
