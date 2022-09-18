import express from 'express'

import container from './container.js'
import candiesEndpoints from './candies/api/v0/candies.api.js'

const router = express.Router()

export default candiesEndpoints(router, container)
