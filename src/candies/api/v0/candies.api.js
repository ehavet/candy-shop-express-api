import { param, body, validationResult } from 'express-validator'

import { CandyNotFoundError } from '../../domain/candies.errors.js'

export default function (router, container) {
    router.use(async function (
        req,
        res,
        next
    ) {
        console.log('Time: %d', Date.now())
        next()
    })

    /**
     * @swagger
     *  tags:
     *    name: Candy Shop
     *    description: API
     */

    /**
     * @swagger
     * components:
     *   schemas:
     *     Candy:
     *       type: object
     *       required:
     *         - id
     *         - name
     *         - sugar_level
     *         - description
     *       properties:
     *         id:
     *           type: integer
     *         name:
     *           type: string
     *         sugar_level:
     *           type: string
     *         description:
     *           type: string
     *       example:
     *         id: 1
     *         name: brown sugar
     *         sugar_level: down
     *         description: provoque la perte des dents
     */

    /**
     * @swagger
     * /v0/candies:
     *   get:
     *     summary: Renvoie la liste des confiseries
     *     tags: [candies]
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Candy'
     */
    router.get('/v0/candies',
        async function (
            req,
            res,
        ) {
            try {
                res.status(200).send(await container.GetCandies())
            } catch (error) {
                res.status(500).send({error: 'erreur 500'})
            }
        })

    /**
     * @swagger
     * /v0/candies/{id}:
     *   get:
     *     summary: Renvoie une confiserie d'après son id
     *     tags: [candies]
     *     parameters:
     *       - in : path
     *         name: id
     *         description: id de la confiserie
     *         schema:
     *           type: integer
     *         required: true
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Candy'
     */
    router.get('/v0/candies/:id',
        param('id').trim().notEmpty().withMessage('candy\'s id must be provided'),
        async function (
            req,
            res,
        ) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const messages = errors.array().map(element => element.msg)
                return res.boom.badRequest(messages)
            }
            try {
                res.status(200).send(await container.GetCandy(req.params.id))
            } catch (error) {
                switch (true) {
                case error instanceof CandyNotFoundError:
                    return res.boom.notFound(error.message)
                default:
                    res.boom.internal(error)
                }

            }
        })

    /**
     * @swagger
     * /v0/candies:
     *   post:
     *     summary: Creation d'une confiserie
     *     tags: [candies]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Candy'
     *     responses:
     *       201:
     *         description: La création a été effectuée
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Candy'
     *       500:
     *         description: Some server error
     */
    router.post('/v0/candies/',
        body('name')
            .trim().notEmpty().withMessage('name property must be provided'),
        body('sugar_level')
            .trim().notEmpty().withMessage('sugar_level property must be provided')
            .isIn(['high', 'down']).withMessage('sugar_level value can be only high or down'),
        body('description')
            .trim().notEmpty().withMessage('description property must be provided'),
        async function (req, res) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const messages = errors.array().map(element => element.msg)
                return res.boom.badRequest(messages)
            }

            try {
                await container.CreateCandy(req.body.name, req.body.sugar_level, req.body.description)
                res.status(201).send()
            } catch (error) {
                res.boom.internal(error)
            }
        })

    /**
     * @swagger
     *  /v0/candies/{id}:
     *    delete:
     *      summary: Supprimer une confiserie selon son id
     *      tags: [candies]
     *      parameters:
     *        - in: path
     *          name: id
     *          description: ID de la confiserie
     *          required: true
     *          schema:
     *            type: integer
     *      responses:
     *        204:
     *          description: La confiserie a été supprimée
     *        404:
     *          description: La confiserie n'a pas été trouvée
     *
     */
    router.delete('/v0/candies/:id',
        param('id').trim().notEmpty().withMessage('candy\'s id must be provided'),
        async function (
            req,
            res,
        ) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const messages = errors.array().map(element => element.msg)
                return res.boom.badRequest(messages)
            }
            try {
                res.status(204).send(await container.DeleteCandy(req.params.id))
            } catch (error) {
                switch (true) {
                case error instanceof CandyNotFoundError:
                    return res.boom.notFound(error.message)
                default:
                    res.boom.internal(error)
                }

            }
        })

    return router
}
