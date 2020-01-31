import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { update_topic } from '../../businessLogic/websocket'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket topic', event);
  const connectionId = event.requestContext.connectionId;
  await update_topic (connectionId, JSON.parse(event.body).topic);
  return {
    statusCode: 200,
    body: ''
  }
}