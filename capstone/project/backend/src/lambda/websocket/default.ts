import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
  // handle "default" route from websocket API
  // this is triggered if a message is malformed
  console.log('Unknown Websocket Action', event);
  return {
    statusCode: 400,
    body: JSON.stringify(event)
  }
}
