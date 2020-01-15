import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'
import {verify} from 'jsonwebtoken'
import {JwtToken} from '../../auth/JwtToken'

const cert : string = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJDR3IUd6sn5T0MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1mYXczdnk2ZS5hdXRoMC5jb20wHhcNMjAwMTEwMDg1NzE5WhcNMzMw
OTE4MDg1NzE5WjAhMR8wHQYDVQQDExZkZXYtZmF3M3Z5NmUuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2lH0X9hUUav7bhQE/KWqgpzO
sugSzNdJTcVwoj00327koyIZs0INCNcl92QNT4hmXtswXP3gad2rp7VaNt9nTMy7
T1SaHvJS5aCMCtzrXwlET4gdC/bqmLO3+GLwZVUxmf//fvsRvyEF0ROAhwKGE1Uz
IQueDtfvVNEKmsA9sgvIyBVec6WOIuYTTLdt2pUwxJoBqr+VlzYjzitouI9/tDax
MdVz1YW8MH6JquR3ZFal1faJdS/cpVFxMihQx/jsvVBnXCV40WqEcBsxk1ShGYII
3PHjLVMBb03Tbyv+87uaICyuVGiMlhNlnECp3DZttfOaNy+NyUHcFyRpXIJhAQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSUizGSHVjdOKgZHYDp
3JDvmwHgfzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBANMQ88fP
CDTEYSuPT2o75hWXrKJ5itSqUjO6cbyL8fYWhXUa9PatSFigaWLi4DHnJR5URQVd
yG6QZQAMcWAY09KJXtFufWVQFQMazGf4ICOsMGqjiB6TZaWNU4VPXnqMpIDRaTdQ
Cje6K+jQqd78hrI5/BPI7z+bjjaK+xCstRJXueGpZSD5tk5xLq+sZjLZIWI5UpVI
5urT0ZdSZYCs8a8PU6OTAB6hlOFa9eRd4lL6hnoVKJGMD2jNzovFWQGIcAKha2Ej
YBcdTw37Z7/ypf5+cKk/L0nBvnGyzLw1jKE3fzZRUNltcMNx6Fhlx4YzOy2Wa5QJ
c3sDB2FERpBM21k=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent) : Promise<CustomAuthorizerResult> =>
{
    try
    {
        const decodedToken = verifyToken( event.authorizationToken,
                                          cert);
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
    return null;
    }
}

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

   return verify (  token, 
                    secret, 
                    { 
                        algorithms: ['RS256'] 
                    }) as JwtToken
}
