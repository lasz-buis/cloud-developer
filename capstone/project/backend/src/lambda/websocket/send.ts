import 'source-map-support/register'
import { socket_disconnect } from '../../businessLogic/websocket'
import { socket_scan } from '../../businessLogic/websocket'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { BroadcastPayload } from '../../models/broadcast_payload'

//
import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient();
import { UnicastPayload } from '../../models/unicast_payload'
const domain = 'wss://3t5d4gcuz4.execute-api.us-west-2.amazonaws.com';
const stage = 'dev'
const connectionParams = 
{
    apiVersion: "2018-11-29",
    endpoint: `${domain}/${stage}`
}
const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);
const connectionsTable = process.env.CONNECTIONS_TABLE;
//


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
	console.log("Endpoint :" + `${domain}/${stage}`);
	const senderId : string = event.requestContext.connectionId;
	
	const message = JSON.parse(event.body).data;
	await broadcast ({senderId , message});
	return {
		statusCode: 200,
		body: ''
  	}
}

async function broadcast (broadcast_payload : BroadcastPayload)
{
  console.log ("Scanning all connections");
  const connections = await socket_scan();
  console.log("SCAN RESULTS: " + JSON.stringify (connections))
  console.log ("Broadcasting");
  const senderId : string = broadcast_payload.senderId;
  const message : string = broadcast_payload.message
  for (const connection of connections.Items) 
  {
    const receiverId : string = connection.id;
    const unicast_payload : UnicastPayload = 
    {
      senderId,
      receiverId,
      message
    }
    await send (unicast_payload);
  }
}

async function send (payload : UnicastPayload)
{
  try
  {
    console.log ("SEND Payload: " + JSON.stringify(payload));
    const senderAlias : string = await getAlias(payload.senderId);
    const receiverAlias : string = await getAlias(payload.receiverId); 
    if (senderAlias && receiverAlias)
    {
      console.log(senderAlias + '=>'+ receiverAlias);
    }
    await apiGateway.postToConnection(
    {
      ConnectionId: payload.receiverId,
      Data: senderAlias + ' : ' + payload.message,
    }).promise();
  } 
  catch (e)
  {
    console.log('Failed to send message', JSON.stringify(e))
    if (e.statusCode === 410) 
    {
      console.log('Stale connection')
      await socket_disconnect (payload.receiverId);
    }
  }
}

async function getAlias (connectionId : string) : Promise <string>
{
	const result = await docClient.query(
	{
    TableName: connectionsTable,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: 
    {
      ':id': connectionId
    }
  }).promise();
	const alias : string = result.Items[0].alias;
	console.log ('Alias Returned from database :' + alias);
	return alias;
}