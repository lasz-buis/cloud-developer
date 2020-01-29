import 'source-map-support/register'
import { ChatAccess } from '../dataLayer/chatAccess'

const chatAccess = new ChatAccess();

export async function socket_disconnect (connectionId : string)
{
  const key = 
  {
    id: connectionId
  }
  await chatAccess.database_delete(key);
}

export async function socket_connect (connectionId: string)
{
  const item = 
  {
    id: connectionId
  }
  await chatAccess.database_create(item);
}

export async function socket_scan ()
{
  return chatAccess.database_scan ();
}

export async function update_alias (connectionId : string , alias : string)
{
  return chatAccess.updateChatAlias (connectionId, alias);
}

export async function update_topic (connectionId : string , topic : string)
{
  return chatAccess.updateChatTopic (connectionId, topic);
}