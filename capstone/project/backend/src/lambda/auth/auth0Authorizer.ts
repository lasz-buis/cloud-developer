import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify/*, decode */} from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { AxiosResponse } from 'axios'
import { JWKS } from '../../auth/jwk'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-faw3vy6e.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user: %s', event.authorizationToken);
  try {
    const jwtToken : JwtPayload = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', { Token: jwtToken});
    
    return {
      principalId: jwtToken.sub,
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
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
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
}

async function verifyToken(authHeader: string): Promise<JwtPayload> 
{
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const jwk : AxiosResponse <JWKS> = await Axios.get(jwksUrl);
  const cert : string = certToPEM(jwk.data.keys[0].x5c[0]);

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}

function certToPEM(cert : string) : string {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  
  return cert;
}