import { sdk } from '../sdk'
import { rotateApiToken } from './rotateApiToken'
import { showApiToken } from './showApiToken'

export const actions = sdk.Actions.of()
  .addAction(showApiToken)
  .addAction(rotateApiToken)
