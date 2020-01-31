import 'source-map-support/register'
import { socket_disconnect } from '../../businessLogic/websocket'
import { socket_scan } from '../../businessLogic/websocket'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient();

const domain = 'wss://3t5d4gcuz4.execute-api.us-west-2.amazonaws.com';
const stage = 'dev'
// const domain = event.requestContext.domainName;
// const stage = event.requestContext.stage;
const connectionParams = 
{
    apiVersion: "2018-11-29",
    endpoint: `${domain}/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);
const connectionsTable = process.env.CONNECTIONS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
	console.log("Endpoint :" + `${domain}/${stage}`);
	const senderId : string = event.requestContext.connectionId;
	const senderAlias : string = await getAlias(senderId);
	const message = JSON.parse(event.body).data;
	await broadcast ({senderAlias , message});
	return {
		statusCode: 200,
		body: ''
  	}
}

async function broadcast (payload)
{
    console.log ("Scanning all connections");
    const connections = await socket_scan();
    console.log("SCAN RESULTS: " + JSON.stringify (connections))
    console.log ("Broadcasting");
    for (const connection of connections.Items) 
    {
        const receiverId : string = connection.id;
        await send(receiverId, payload);
    }
}

async function send (receiverId : string, payload: any) 
{
  try
  {
    console.log('Sending message to a connection', receiverId);
    await apiGateway.postToConnection(
    {
      ConnectionId: receiverId,
      Data: payload.senderAlias + ' : ' + payload.message,
    }).promise();
  } 
  catch (e)
  {
    console.log('Failed to send message', JSON.stringify(e))
    if (e.statusCode === 410) 
    {
      console.log('Stale connection')
      await socket_disconnect (receiverId);
    }
  }
}

async function getAlias (senderId : string) 
{
	const result = await docClient.query(
	{
        TableName: connectionsTable,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: 
        {
          ':id': senderId
        }
    }).promise();
	const alias = result.Items[0];
	console.log ('Items Returned from database' + alias);
	return senderId;
}