import 'source-map-support/register'
// import { socket_disconnect } from '../../businessLogic/websocket'
// import { socket_scan } from '../../businessLogic/websocket'
// import * as AWS  from 'aws-sdk'
// import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

// const domain = 'wss://mb5ka21g0d.execute-api.us-west-2.amazonaws.com';
// const stage = 'dev'
// // const domain = event.requestContext.domainName;
// // const stage = event.requestContext.stage;
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

// export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
// {
//   const connections = await socket_scan();
//   for (const connection of connections.Items) 
//   {
//     const connectionId = connection.id;
//     try
// 		{
// 			const connectionParams = 
// 			{
// 				apiVersion: "2018-11-29",
// 				endpoint: event.requestContext.domainName + "/" + 
//                   event.requestContext.stage
// 			}
// 			const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);
// 			console.log('Sending message to a connection', connectionId);
// 			await apiGateway.postToConnection(
// 			{
// 			  ConnectionId: connectionId,
// 			  Data: JSON.stringify(JSON.parse(event.body).data),
// 			}).promise();
// 		} 
// 		catch (e)
// 		{
// 			console.log('Failed to send message', JSON.stringify(e))
// 			if (e.statusCode === 410) 
// 			{
// 			  console.log('Stale connection')
// 			  await socket_disconnect (connectionId);
// 			}
// 		}
//   }
//   return {
//     statusCode: 200,
//     body: ''
//   }
// }
const AWS = require('aws-sdk');

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const handler = async (event) => 
{
	console.log(event)
  let connectionData = undefined;
  try 
  {
    connectionData = await DDB.scan(
    {
        TableName: "Connections-dev",
        ProjectionExpression: 'id' 
    }).promise();
    console.log ('Scan Results : ' + JSON.stringify(connectionData));
  } 
  catch (e) 
  {
    return { statusCode: 500, body: e.stack };
  }
  
  const apigwManagementApi = new AWS.ApiGatewayManagementApi(
  {
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  const postData = event.requestContext.connectionId + " : " + JSON.parse(event.body).message;
  console.log("Data: " + postData);
  const postCalls = connectionData.Items.map(async ({ id }) => {
    try 
    {
      await apigwManagementApi.postToConnection(
        { 
          ConnectionId: id, 
          Data: postData 
        }).promise();
    } 
    catch (e) 
    {
      if (e.statusCode === 410) 
      {
        console.log(`Found stale connection, deleting ${id}`);
        await DDB.delete(
          {
              TableName: "Connected", 
              Key: { id } 
          }).promise();
      } 
      else 
      {
        throw e;
      }
    }
  });
  try 
  {
    await Promise.all(postCalls);
  } 
  catch (e) 
  {
    return { statusCode: 500, body: e.stack };
  }
  return { statusCode: 200, body: 'Data sent.' };
};

