import 'source-map-support/register'
import { ChatAccess } from '../dataLayer/chatAccess'
import { UnicastPayload } from '../models/unicast_payload'
import { BroadcastPayload } from '../models/broadcast_payload'

const chatAccess = new ChatAccess();

export async function socket_disconnect (connectionId : string)
{
  console.log ("BUSINESS LAYER: socket_disconnect called");
  const key = 
  {
    id: connectionId
  }
  await chatAccess.database_delete(key);
}

export async function socket_connect (connectionId: string)
{
  console.log ("BUSINESS LAYER: socket_connect called");
  const item = 
  {
    id: connectionId
  }
  await chatAccess.database_create(item);
}

export async function socket_scan ()
{
  console.log ("BUSINESS LAYER: socket_scan called");
  return await chatAccess.database_scan ();
}

export async function update_alias (connectionId : string , alias : string)
{
  console.log ("BUSINESS LAYER: update_alias called");
  return await chatAccess.updateChatAlias (connectionId, alias);
}

export async function update_topic (connectionId : string , topic : string)
{
  console.log ("BUSINESS LAYER: update_topic called");
  return await chatAccess.updateChatTopic (connectionId, topic);
}

export async function get_alias (connectionId : string) : Promise <string>
{
  console.log ("BUSINESS LAYER: get_alias called");
  return await chatAccess.queryAlias (connectionId);
}

export async function socket_send (payload : UnicastPayload)
{
  console.log ("BUSINESS LAYER: socket_send called");
  try
  {
    const senderAlias   : string = await get_alias(payload.senderId);
    const receiverAlias : string = await get_alias(payload.receiverId); 
    if (senderAlias && receiverAlias)
    {
      console.log (senderAlias + '=>'+ receiverAlias);
    }
    else
    {
      console.error ('Alias not found');
    }
    const data : string = senderAlias + ': ' + payload.message;
    await chatAccess.send (payload.receiverId, data)
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

export async function socket_broadcast (payload : BroadcastPayload)
{
  console.log ("BUSINESS LAYER: socket_broadcast called");
  const connections = await socket_scan();
  const senderId : string = payload.senderId;
  const message  : string = payload.message
  for (const connection of connections.Items) 
  {
    const receiverId : string = connection.id;
    const unicast_payload : UnicastPayload = 
    {
      senderId,
      receiverId,
      message
    }
    await socket_send (unicast_payload);
  }
}