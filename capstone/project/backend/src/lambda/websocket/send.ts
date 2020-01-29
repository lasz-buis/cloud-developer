import 'source-map-support/register'
import { socket_disconnect } from '../../businessLogic/websocket'
import { socket_scan } from '../../businessLogic/websocket'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

// const domain = 'wss://mb5ka21g0d.execute-api.us-west-2.amazonaws.com';
// const stage = 'dev'
// const domain = event.requestContext.domainName;
// const stage = event.requestContext.stage;
// const connectionParams = 
// {
//     apiVersion: "2018-11-29",
//     endpoint: `${domain}/${stage}`
// }
// const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);

// export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
// {
//   broadcast (JSON.parse(event.body).data);
//   // send (JSON.parse(event.body).connectionId, JSON.parse(event.body).data)
//   return {
//     statusCode: 200,
//     body: ''
//   }
// }

// async function broadcast (payload)
// {
//     const connections = await socket_scan();
//     for (const connection of connections.Items) 
//     {
//         const connectionId = connection.id;
//         await send(connectionId, payload);
//     }
// }

// async function send (connectionId : string, payload: any) 
// {
//   try
//   {
//     console.log('Sending message to a connection', connectionId);
//     await apiGateway.postToConnection(
//     {
//       ConnectionId: connectionId,
//       Data: JSON.stringify(payload),
//     }).promise();
//   } 
//   catch (e)
//   {
//     console.log('Failed to send message', JSON.stringify(e))
//     if (e.statusCode === 410) 
//     {
//       console.log('Stale connection')
//       await socket_disconnect (connectionId);
//     }
//   }
// }

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
  const connections = await socket_scan();
  for (const connection of connections.Items) 
  {
    const connectionId = connection.id;
    try
		{
			const connectionParams = 
			{
				apiVersion: "2018-11-29",
				endpoint: event.requestContext.domainName + "/" + 
                  event.requestContext.stage
			}
			const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);
			console.log('Sending message to a connection', connectionId);
			await apiGateway.postToConnection(
			{
			  ConnectionId: connectionId,
			  Data: JSON.stringify(JSON.parse(event.body).data),
			}).promise();
		} 
		catch (e)
		{
			console.log('Failed to send message', JSON.stringify(e))
			if (e.statusCode === 410) 
			{
			  console.log('Stale connection')
			  await socket_disconnect (connectionId);
			}
		}
  }
  return {
    statusCode: 200,
    body: ''
  }
}
