import 'source-map-support/register'
import { ChatAccess } from '../dataLayer/chatAccess'
import { UnicastPacket } from '../models/unicast_payload'
import { BroadcastPacket } from '../models/broadcast_payload'
import { MulticastPacket } from '../models/multicast_payload'

const chatAccess = new ChatAccess();

// disconnect from the websocket and remeove entry from database
export async function socket_disconnect (connectionId : string)
{
  console.log ("BUSINESS LAYER: socket_disconnect called");
  const key = 
  {
    id: connectionId
  }
  await chatAccess.database_delete(key);
}

// connect to the websocket 
export async function socket_connect (connectionId: string)
{
  console.log ("BUSINESS LAYER: socket_connect called");
  const item = 
  {
    id: connectionId
  }
  await chatAccess.database_create(item);
}

// scan every element in the table of users
export async function socket_scan ()
{
  console.log ("BUSINESS LAYER: socket_scan called");
  return await chatAccess.database_scan ();
}

// query the table of users on topic
export async function query_topic (topic : string)
{
  console.log ("BUSINESS LAYER: socket_query called");
  return await chatAccess.queryTopic (topic);
}

// update the user's alias in the table of users
export async function update_alias (connectionId : string , alias : string)
{
  console.log ("BUSINESS LAYER: update_alias called");
  return await chatAccess.updateChatAlias (connectionId, alias);
}

// update the topic of the user in the table
export async function update_topic (connectionId : string , topic : string)
{
  console.log ("BUSINESS LAYER: update_topic called");
  return await chatAccess.updateChatTopic (connectionId, topic);
}

// get the name of the user with the specified ID
export async function get_alias (connectionId : string) : Promise <string>
{
  console.log ("BUSINESS LAYER: get_alias called");
  return await chatAccess.queryAlias (connectionId);
}

// send a message to a single user
export async function socket_send (packet : UnicastPacket)
{
	console.log ("BUSINESS LAYER: socket_send called");
	const endpoint : string = packet.endpoint;
	const receiverId : string = packet.receiverId;
	const senderId : string = packet.senderId;
	const payload : string = packet.payload;
	console.log('Sending message to a connection', receiverId);

	const senderAlias : string = await chatAccess.queryAlias (senderId);
	const receiverAlias : string = await chatAccess.queryAlias (receiverId);
	console.log (senderAlias + ' => ' + receiverAlias + ' : ' + payload);
	
	const taggedPayload : string = senderAlias + ' : ' + payload;
	await chatAccess.send (endpoint, receiverId, taggedPayload);
}

// send a message to all the users in the table
export async function socket_broadcast (packet : BroadcastPacket)
{
	console.log ("BUSINESS LAYER: socket_broadcast called");
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
			await socket_send (sendPacket);
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

// send a message to all the users in the same topic
export async function socket_multicast (packet : MulticastPacket)
{
	console.log ("BUSINESS LAYER: socket_multicast called");
	const connections = await query_topic(packet.topic);	
	for (const connection of connections.Items) 
	{
		const receiverId : string = connection.id;
		try
		{
			const endpoint = packet.endpoint;
			const senderId = packet.senderId;
			const payload  = packet.payload ;
			const sendPacket : UnicastPacket =
			{
				endpoint,
				senderId,
				receiverId,
				payload
			}
			await socket_send (sendPacket);
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

// get the  topic that a specified user has
export async function socket_get_topic (connectionId : string) : Promise <string>
{
	console.log ("BUSINESS LAYER: socket_get_topic called");
	return await chatAccess.getTopicForId (connectionId);
}