import {decode} from 'jsonwebtoken'
import {JwtToken} from './JwtToken'

/**
 * parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from JWT token
 */

export function getUserId(jwtToken: string): string {
    const decodedJwt = decode(jwtToken) as JwtToken
    return decodedJwt.sub;
}