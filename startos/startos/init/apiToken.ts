import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// Generate the scenes API bearer token whenever it is absent — fresh install,
// update from a version that predates the API, or a repaired store. Rotation
// happens through the rotateApiToken action, never here.
export const apiToken = sdk.setupOnInit(async (effects) => {
  const store = await storeJson.read().once()
  if (!store?.apiToken) {
    await storeJson.merge(effects, {
      apiToken: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 48 }),
    })
  }
})
