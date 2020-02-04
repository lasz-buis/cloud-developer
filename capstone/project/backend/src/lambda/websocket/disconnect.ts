import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { socket_disconnect } from '../../businessLogic/websocket'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
  // handle "disconnect" route from websocket API
  console.log('Websocket disconnect', event)
  const connectionId = event.requestContext.connectionId;
  console.log('Removing item: ', connectionId)
  // remove user from database
  await socket_disconnect (connectionId);
  return {
    statusCode: 200,
    body: ''
  }
}
