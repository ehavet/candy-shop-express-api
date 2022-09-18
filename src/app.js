import cors from 'cors'
import express from 'express'
import boom from 'express-boom'
import logger from 'express-pino-logger'

import bodyParser from 'body-parser'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import config from './config.js'
import candiesRoutes from './routes.js'

const api_url = `http://localhost:${config.get('APP_PORT')}`

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Candy Shop',
            version: '0.1',
            description: 'Une simple Express.js API',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'OCTO Academy',
                url: 'https://www.octo.academy',
                email: 'academy@octo.com',
            },
        },
        servers: [
            {
                url: `${api_url}`
            },
        ],
    },
    apis: ['./src/candies/api/v0/candies.api.js'],
}
const specs = swaggerJsdoc(options)

const app = express()

function init () {
    app.use(cors())
    app.use(logger())
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())
    app.use(boom())

    app.use(bodyParser.json())
    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    )

    candiesRoutes.use('/doc', swaggerUi.serve)
    candiesRoutes.get('/doc', swaggerUi.setup(specs))

    app.use(candiesRoutes)
    app.use(function(req,res){
        res.boom.notFound(`Impossible de trouver la ressource ${req.path}`)
    })

    app.listen(config.get('APP_PORT'), () => {
        console.log(`Express server listening on ${api_url}`)
    })
}

init()
