import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_18_0_0 = VersionInfo.of({
  version: '0.18.0:0',
  releaseNotes: {
    en_US: 'Initial release of Excalidraw for StartOS',
    es_ES: 'Versión inicial de Excalidraw para StartOS',
    de_DE: 'Erste Veröffentlichung von Excalidraw für StartOS',
    pl_PL: 'Pierwsze wydanie Excalidraw dla StartOS',
    fr_FR: "Version initiale d'Excalidraw pour StartOS",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
