import { Router, Request, Response } from 'express';

import { User } from '../models/User';
import { AuthRouter, requireAuth } from './auth.router';

const router: Router = Router();

router.use('/auth', AuthRouter);

router.get('/', async (req: Request, res: Response) => {
});

router.get('/:id', async (req: Request, res: Response) => {
    let { id } = req.params;
    if (!id)
    {
        res.status(400).send("user id required");
    }
    const item = await User.findByPk(id).catch (err=>
        {
            console.log ("Error : " + err);
        });
    if (!item)
    {
        res.status(400).send("user not found");
    }
    res.status(200).send(item);
});

export const UserRouter: Router = router;