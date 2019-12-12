import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { NextFunction } from 'connect';
import * as jwt from 'jsonwebtoken';
import * as AWS from '../../../../aws';
import * as c from '../../../../config/config';

const router: Router = Router();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
 //   return next();
     if (!req.headers || !req.headers.authorization){
         return res.status(401).send({ message: 'No authorization headers.' });
     }
     
 
     const token_bearer = req.headers.authorization.split(' ');
     if(token_bearer.length != 2){
         return res.status(401).send({ message: 'Malformed token.' });
     }
     
     const token = token_bearer[1];
     return jwt.verify(token, c.config.jwt.secret , (err, decoded) => {
       if (err) {
         return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
       }
       return next();
     });
 }

// Get all feed items 
router.get('/', async (req: Request, res: Response) => {
    console.log ("[DEBUG] Get all feed items");
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

// Get a specific resource
router.get('/:id', 
    async (req: Request, res: Response) => {
    console.log ("[DEBUG] Get item by  id");
    let { id } = req.params;
    if (!id)
    {
        res.status(400).send ("id is required");
    }
    else
    {
        const item = await FeedItem.findByPk (id)
            .then (found_item=>
            {
                res.status(200).send (found_item);
            })
           .catch (err=>
            {
                res.status (400).send (err);
            });
        }
});

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        console.log ("[DEBUG] Patch item by ID");
        //@TODO try it yourself
        const id = req.params.id;
        const caption = req.body.caption;
        const url = req.body.url;
        if (!id)
        {
            res.status(400).send('ID required');
        }
        if (!caption)
        {
            res.status(400).send ('Caption required');
        }
        if (!url)
        {
            res.status(400).send ('URL required');
        }
         await FeedItem.update(
            {
                url : url,
                caption : caption
            },
            {
             where:
             {
                 id: id
             }   
            })
             .then (updatedItem =>
                {
                    res.status(200).send('Item Updated');
                })
               .catch(err=>
                    {
                        res.status(400).send(err);
                    });
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    console.log ("[DEBUG] Get signed URL");
    let { fileName } = req.params;
    if (!fileName)
    {
        res.status(400).send ("file name is required");
    }
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    console.log ("[DEBUG] Post file to S3 bucket");
    const caption : string = req.body.caption;
    const fileName : string = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;