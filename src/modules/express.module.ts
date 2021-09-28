import express from 'express';

export default class ExpressModule {

    constructor(app: express.Application) {

        const router = express.Router({});

        router.get('/healthcheck', async (request, response) => {
            const healthCheck = {
                uptime: process.uptime(),
                message: 'OK',
                timestamp: Date.now()
            };
            try {
                response.send(healthCheck);
            } catch (e) {
                healthCheck.message = e;
                response.status(503).send();
            }
        });

        app.use('/', router);

        console.log('✌️ Express loaded!')
    }
}

