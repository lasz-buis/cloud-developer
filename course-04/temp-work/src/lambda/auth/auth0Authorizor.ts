import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'

import {verify} from 'jsonwebtoken'
import {JwtToken} from '../../auth/JwtToken'

import * as middy from 'middy'
import {secretsManager} from 'middy/middlewares'

const secretId = process.env.AUTH_0_SECRET_ID;
const secretField = process.env.AUTH_0_SECRET_FIELD;
// const client = new AWS.SecretsManager();

// //Cache secret if a lambda instance is reused
// let cachedSecret: string;

// async function verifyToken (authHeader : string): Promise<JwtToken>
// {
//     if (!authHeader)
//     {
//         throw new Error ('No authorization header');
//     }

//     if (!authHeader.toLocaleLowerCase().startsWith('bearer '))
//     {
//         throw new Error ('Invalid authorization header');
//     }

//     const split = authHeader.split(' ');
//     const token = split [1];

//     const secretObject: any = await getSecret();
//     const secret = secretObject[secretField]

//    return verify (token, secret) as JwtToken;
// }

function verifyToken (authHeader : string, secret: string):JwtToken
{
    if (!authHeader)
    {
        throw new Error ('No authorization header');
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer '))
    {
        throw new Error ('Invalid authorization header');
    }

    const split = authHeader.split(' ');
    const token = split [1];

   return verify (token, secret) as JwtToken;
}

export const handler = middy( async (event: CustomAuthorizerEvent,
                                     context): Promise<CustomAuthorizerResult> =>
{
    try
    {
        const decodedToken = verifyToken( event.authorizationToken,
                                          context.AUTH0_SECRET[secretField]);
        console.log('User was authorised');

        return {
            principalId: decodedToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    }catch (e){
        console.log ('User was not authorized', e.message);

        return {
            principalId: 'user',
            policyDocument:{
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
});

// async function getSecret (){
//     if (cachedSecret) return cachedSecret;

//     const data = await client
//     .getSecretValue({
//         SecretId: secretId
//     }).promise();

//     cachedSecret = data.SecretString;

//     return JSON.parse(cachedSecret);
// }

handler.use(secretsManager({
    cache: true,
    cacheExpiryInMillis: 6000,
    throwOnFailedCall: true,
    secrets:{
        AUTH0_SECRET: secretId
    }
}));