import 'source-map-support/register'
import { MulticastPacket } from '../../models/multicast_payload'
import { socket_multicast } from '../../businessLogic/websocket'
import { socket_get_topic } from '../../businessLogic/websocket'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
	// handle "send" route from websocket API
	const endpoint : string = event.requestContext.domainName + "/" + event.requestContext.stage;
	const senderId : string = event.requestContext.connectionId;
	const topic    : string = await socket_get_topic(senderId);
	const payload  : string = JSON.stringify(JSON.parse(event.body).message);
	console.log ('Topic : ' + topic);
	// input to the socket_send function is restricted to type Multicast
	const sendPacket : MulticastPacket =
	{
		endpoint,
		topic,
		senderId,
		payload,
	}
	// send the message payload to all users in the group
	await socket_multicast (sendPacket);
	return {
		statusCode: 200,
		body: ''
	}
}
