import { Router, Request, Response } from 'express';

import { User } from '../models/User';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';

import * as EmailValidator from 'email-validator';
import { config } from '../../../../config/config';

const router: Router = Router();

async function generatePassword(plainTextPassword: string): Promise<string> 
{
    console.log ("[DEBUG] : generatePassword()");
    const saltRounds = 10;
    var hash : string ;
    try 
    {
        console.log ("[DEBUG] : Generating salt");
        var salt : string = await bcrypt.genSalt(saltRounds);
        console.log ("[DEBUG] : Generating hash");
        hash = await bcrypt.hash(plainTextPassword, salt);
    }
    catch(err)
    {
        console.log ("[DEBUG] : Error generating hash");
        console.log ("bcrypt Error : " + err);
    }
    return hash;
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    //@TODO Use Bcrypt to Compare your password to your Salted Hashed Password
    console.log ("[DEBUG] : comparePasswords()");
    const comparison = await bcrypt.compare(plainTextPassword, hash);
    return comparison;
}

function generateJWT(user: User): string {
    console.log ("[DEBUG] : generateJWT()");
    //@TODO Use jwt to create a new JWT Payload containing
    try
    {
        console.log ("[DEBUG] : Signing JWT");
        const token : string = jwt.sign(JSON.stringify(user), config.jwt.secret);
        console.log ("[DEBUG] : Token " + token);
        return token;
    }
    catch (e)
    {
        console.log ("[DEBUG] : Error signing JWT");
        return undefined;
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) 
{
    console.log ("[DEBUG] : requireAuth()");
    if (!req.headers || !req.headers.authorization)
    {
        console.log ("[DEBUG] : No authorization headers found");
        return res.status(401).send(
            { 
                message: 'No authorization headers.' 
            });
    }
    
    const token_bearer = req.headers.authorization.split(' ');
    console.log ('[DEBUG] : Auth Token : ' + 
                 JSON.stringify(req.headers.authorization));
    if(token_bearer.length != 2)
    {
        console.log ("[DEBUG] : Malformed token");
        return res.status(401).send(
            { 
                message: 'Malformed token.' 
            });
    }

    const token = token_bearer[1];
    console.log ("[DEBUG] : Verifying token");
    return jwt.verify(token, config.jwt.secret, (err, decoded) => 
    {
      if (err) 
      {
        console.log ("[DEBUG] : Failed authentication");
        return res.status(500).send(
            { 
                auth: false, 
                message: 'Failed to authenticate.' 
            });
      }
      return next();
    });
}

router.get('/verification', 
    requireAuth, 
    async (req: Request, res: Response) => 
    {
        console.log ("[DEBUG] : GET /verification");
        return res.status(200).send(
            {
                auth: true, 
                message: 'Authenticated.' 
            });
    });

router.post('/login', async (req: Request, res: Response) => 
{
    console.log ("[DEBUG] : Login");
    const email     : string = req.body.email;
    const password  : string = req.body.password;
    console.log ("[DEBUG] : Checking for email in request");
    // check email is valid
    if (!email)
    {
        console.log ("[DEBUG] : Email is required");
        return res.status(400).send(
            {
                auth: false,
                message: 'Email is required'
            }); 
    }
    else if (!EmailValidator.validate(email)) 
    {
        console.log ("[DEBUG] : Email is malformed");
        return res.status(400).send(
            {
                auth: false,
                message: 'Email is malformed',
            });
    }
    console.log ("[DEBUG] : Checking for password in request");
    // check email password valid
    if (!password) 
    {
        console.log ("[DEBUG] : Password is required");
        return res.status(400).send(
            { 
                auth: false, 
                message: 'Password is required' 
            });
    }
    console.log ("[DEBUG] : Searching user");
    const user = await User.findByPk(email)
        .catch (err=>
        {
           console.log ("[DEBUG] : Sequalize Error : " + err);
        });
    // check that user exists
    if(!user) 
    {
        console.log ("[DEBUG] : User not found");
        return res.status(401).send(
            { 
                auth: false, 
                message: 'Unauthorized : User not found' 
            });
    }
    console.log ("[DEBUG] : Comparing passwords");
    // check that the password matches
    const authValid = await comparePasswords(password, user.password_hash).catch (err=>
    {
      console.log ("[DEBUG] : Error : " + err);
    });
    console.log ("[DEBUG] : Validating password");
    if(!authValid) 
    {
        console.log ("[DEBUG] : Invalid password");
        return res.status(401).send(
            { 
                auth: false, 
                message: 'Unauthorized : Invalid password' 
            });
    }
    else
    {
        console.log ("[DEBUG] : Password valid");
    }
    // Generate JWT
    console.log ("[DEBUG] : Generating JWT");
    const jwt : string = generateJWT(user);

    res.status(200).send(
        { 
            auth: true, 
            token: jwt, 
            user: user.short()
        });
});

//register a new user
router.post('/', async (req: Request, res: Response) => 
{
    console.log ("[DEBUG] : Register a new user");
    const email : string                = req.body.email;
    const plainTextPassword : string    = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) 
    {
        console.log ("[DEBUG] : Email is required");
        return res.status(400).send(
            {
                 auth: false, 
                 message: 'Email is required or malformed' 
            });
    }

    // check email password valid
    if (!plainTextPassword) 
    {
        console.log ("[DEBUG] : Password is required");
        return res.status(400).send(
            {
                auth: false, 
                message: 'Password is required' 
            });
    }

    // find the user
    console.log ("[DEBUG] : Searching user");
    const user = await User.findByPk(email).catch (err=>
        {
            console.log ("[DEBUG] : Sequalize Error : " + err);
        });
    // check that user doesnt exists
    if(user) 
    {
        console.log ("[DEBUG] : User may already exist");
        return res.status(422).send(
            { 
                auth: false, 
                message: 'User may already exist' 
            });
    }
    console.log ("[DEBUG] : Generating password hash");
    const password_hash = await generatePassword(plainTextPassword);

    const newUser : User = new User(
    {
        email: email,
        password_hash: password_hash
    });

    let savedUser : User;
    console.log ("[DEBUG] : Saving new user to database");
    try 
    {
        savedUser = await newUser.save();
        console.log ("[DEBUG] : User saved to database");
    } 
    catch (e) 
    {
        console.log ("[DEBUG] : Error saving user : " + e);
    }

    // Generate JWT
    console.log ("[DEBUG] : Generating JWT");
    const jwt : string = generateJWT(savedUser);

    res.status(201).send(
        {
            token: jwt, 
            user: savedUser.short()
        });
});

router.get('/', async (req: Request, res: Response) => {
    res.send('auth')
});

export const AuthRouter: Router = router;