import 'source-map-support/register'
import { socket_disconnect } from '../../businessLogic/websocket'
import { socket_scan } from '../../businessLogic/websocket'
import * as AWS	from 'aws-sdk'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import {ChatAccess} from '../../dataLayer/chatAccess'
const chatAccess = new ChatAccess();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
	const endpoint : string = event.requestContext.domainName + "/" + event.requestContext.stage;
	const senderId : string = event.requestContext.connectionId;
	const payload : string = JSON.stringify(JSON.parse(event.body).data);
	const sendPacket : BroadcastPacket =
	{
		endpoint,
		senderId,
		payload,
	}
	await broadcast (sendPacket);
	return {
		statusCode: 200,
		body: ''
	}
}
//******************************************************************************
async function broadcast (packet : BroadcastPacket)
{
	const connections = await socket_scan();	
	for (const connection of connections.Items) 
	{
		const receiverId : string = connection.id;
		try
		{
			const endpoint = packet.endpoint;
			const senderId = packet.senderId
			const payload = packet.payload
			const sendPacket : UnicastPacket =
			{
				endpoint,
				senderId,
				receiverId,
				payload
			}
			await send (sendPacket);
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
}

// async function multicast (packet : MulticastPacket)
// {
// 	const topic = packet.topic;
// 	const connections = await socket_query (topic);	
// 	for (const connection of connections.Items) 
// 	{
// 		const receiverId : string = connection.id;
// 		try
// 		{
// 			const endpoint = packet.endpoint;
// 			const senderId = packet.senderId
// 			const payload = packet.payload
// 			const sendPacket : UnicastPacket =
// 			{
// 				endpoint,
// 				senderId,
// 				receiverId,
// 				payload
// 			}
// 			await send (sendPacket);
// 		} 
// 		catch (e)
// 		{
// 			console.log('Failed to send message', JSON.stringify(e))
// 			if (e.statusCode === 410) 
// 			{
// 				console.log('Stale connection')
// 				await socket_disconnect (connectionId);
// 			}
// 		}
// 	}
// }

async function send (packet : UnicastPacket)
{
	const endpoint : string = packet.endpoint;
	const receiverId : string = packet.receiverId;
	const senderId : string = packet.senderId;
	const payload : string = packet.payload;
	console.log('Sending message to a connection', receiverId);

	const senderAlias : string = await chatAccess.queryAlias (senderId);
	const receiverAlias : string = await chatAccess.queryAlias (receiverId);
	console.log (senderAlias + ' => ' + receiverAlias + ' : ' + payload);
	
	const taggedPayload : string = senderAlias + ' : ' + payload;
	await DL_SEND (endpoint, receiverId, taggedPayload);
}
//******************************************************************************
async function DL_SEND (endpoint, receiverId, payload)
{
	const connectionParams = 
	{
		apiVersion: "2018-11-29",
		endpoint: endpoint
	}
	const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);
	await apiGateway.postToConnection(
	{
		ConnectionId: receiverId,
		Data: payload,
	}).promise();
}
//******************************************************************************
interface BroadcastPacket
{
	endpoint : string
	senderId : string
	payload : string
}

// interface MulticastPacket
// {
// 	endpoint : string
// 	topic : string
// 	senderId : string
// 	payload : string
// }

interface UnicastPacket
{
	endpoint : string
	senderId : string
	receiverId: string
	payload : string
}