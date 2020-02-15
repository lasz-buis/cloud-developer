import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import * as AWS from '../../../../aws';
import { config } from '../../../../config/config';
import { NextFunction } from 'connect';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const router: Router = Router();

export function requireAuth(req: Request, res: Response, next: NextFunction) 
{
    console.log ('[DEBUG] : requireAuth() Entered');
    if (!req.headers || !req.headers.authorization)
    {
        console.log ('[DEBUG] : No authorization headers');
        return res.status(401).send({ message: 'No authorization headers.' });
    }
    
    const token_bearer = req.headers.authorization.split(' ');
    if(token_bearer.length != 2)
    {
        console.log ('[DEBUG] : Malformed token');
        return res.status(401).send({ message: 'Malformed token.' });
    }
    
    const token = token_bearer[1];

    return jwt.verify(token, config.jwt.secret, (err, decoded) => 
    {
        console.log ('[DEBUG] : Varifying token');
        if (err) 
        {
            console.log ('[DEBUG] : Failed to authenticate');
            return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
        }
        return next();
    });
}

// Get all feed items 
router.get('/', async (req: Request, res: Response) => 
{
    console.log ("[DEBUG] : Get all feed items");
    try
    {
        console.log ('[DEBUG] : Finding Items');
        const items = await FeedItem.findAndCountAll(
        {
            order: [['id', 'DESC']]
        });
        console.log ('[DEBUG] : Mapping items');
        items.rows.map((item) => 
        {
            if(item.url) 
            {
                console.log ('[DEBUG] : Item URL found');
                try
                {
                    console.log ('[DEBUG] : Getting signed URL');
                    item.url = AWS.getGetSignedUrl(item.url);
                }
                catch (e)
                {
                    console.log ('[DEBUG] : Could not get signed URL : ' + e);
                }
            }
        });
        console.log ('[DEBUG] : Sending Items to feed');
        res.send(items);
    }
    catch (e)
    {
        console.log ('Could not retrieve feed items due to error : ' + e);
    }
});

// Get a specific resource
router.get('/:id', 
    async (req: Request, res: Response) => 
{
    console.log ("[DEBUG] : Get item by  id");
    let { id } = req.params;
    if (!id)
    {
        console.log ("[DEBUG] : id is required");
        res.status(400).send ("id is required");
    }
    else
    {
        const item = await FeedItem.findByPk (id)
            .then (found_item=>
            {
                console.log ("[DEBUG] : Item found : " + JSON.stringify(found_item));
                res.status(200).send (found_item);
            })
           .catch (err=>
            {
                console.log ('Could not find Item by ID due to error : ' + err);
                res.status (400).send (err);
            });
    }
});


// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        console.log ("[DEBUG] : Patch item by ID");
        //@TODO try it yourself
        const id        = req.params.id;
        const caption   = req.body.caption;
        const url       = req.body.url;
        if (!id)
        {
            console.log ("[DEBUG] : ID required");
            res.status(400).send('ID required');
        }
        if (!caption)
        {
            console.log ("[DEBUG] : Caption required");
            res.status(400).send ('Caption required');
        }
        if (!url)
        {
            console.log ("[DEBUG] : URL required");
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
                    console.log ("[DEBUG] : Item Updated");
                    res.status(200).send('Item Updated');
                })
               .catch(err=>
                {
                    console.log ('Could not update item due to error : ' + err);
                    res.status(400).send(err);
                });
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => 
{
    console.log ("[DEBUG] : Get signed URL");
    let { fileName } = req.params;
    if (!fileName)
    {
        console.log ("[DEBUG] : file name is require");
        res.status(400).send ("file name is required");
    }
    try
    {
        console.log ("[DEBUG] : Getting PutSignedURL");
        const url = AWS.getPutSignedUrl(fileName);
        res.status(201).send({url: url});
    }
    catch (e)
    {
        console.log ("[DEBUG] : Could not get PutSignedUrl");
        res.status(400).send ("Could not get PutSignedUrl"); 
    }
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    console.log ("[DEBUG] : Post file to S3 bucket");
    const caption : string = req.body.caption;
    const fileName : string = req.body.url;

    // check Caption is valid
    if (!caption) 
    {
        console.log ("[DEBUG] : Caption is required or malformed");
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) 
    {
        console.log ("[DEBUG] : File url is required");
        return res.status(400).send({ message: 'File url is required' });
    }
    try
    {
        console.log ("[DEBUG] : Creating new item");
        const item = new FeedItem({
                caption: caption,
                url: fileName
        });
        console.log ("[DEBUG] : Saving new item to database");
        const saved_item = await item.save();
        console.log ("[DEBUG] : Getting signed url");
        saved_item.url = AWS.getGetSignedUrl(saved_item.url);
        res.status(201).send(saved_item);
    }
    catch (e)
    {
        console.log ("[DEBUG] : error creating item : " + e);
    }
});

export const FeedRouter: Router = router;