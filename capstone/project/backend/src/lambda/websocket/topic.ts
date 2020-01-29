import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
// import { socket_connect } from '../../businessLogic/websocket'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket topic', event);
  // const connectionId = event.requestContext.connectionId;
  // const item = {
  //   id: connectionId
  // }
  return {
    statusCode: 200,
    body: ''
  }
}
