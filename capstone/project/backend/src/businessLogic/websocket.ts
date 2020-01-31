import 'source-map-support/register'
import { ChatAccess } from '../dataLayer/chatAccess'

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
  return chatAccess.database_scan ();
}

export async function update_alias (connectionId : string , alias : string)
{
  console.log ("BUSINESS LAYER: update_alias called");
  return chatAccess.updateChatAlias (connectionId, alias);
}

export async function update_topic (connectionId : string , topic : string)
{
  console.log ("BUSINESS LAYER: update_topic called");
  return chatAccess.updateChatTopic (connectionId, topic);
}