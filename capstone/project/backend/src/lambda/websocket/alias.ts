import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { update_alias } from '../../businessLogic/websocket'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
  // handle "alias" route from websocket API
  console.log('Websocket alias', event);
  const connectionId = event.requestContext.connectionId;
  // set the alias of the user 
  await update_alias (connectionId, JSON.parse(event.body).alias);
  return {
    statusCode: 200,
    body: ''
  }
}