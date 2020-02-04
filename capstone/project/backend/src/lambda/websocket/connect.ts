import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { socket_connect } from '../../businessLogic/websocket'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
  // handle "connect" route from websocket API
  console.log('Websocket connect', event);
  const connectionId = event.requestContext.connectionId;
  const item = 
  {
    id: connectionId,
  }
  console.log('Storing item: ', item);
  await socket_connect (connectionId);
  return {
    statusCode: 200,
    body: ''
  }
}