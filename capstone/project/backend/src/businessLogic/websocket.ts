import 'source-map-support/register'
import { TodoAccess } from '../dataLayer/todoAccess'

const connectionsTable = process.env.CONNECTIONS_TABLE;
const todoAccess = new TodoAccess();

export async function socket_disconnect (connectionId : string)
{
  const key = 
  {
      id: connectionId
  }
  await todoAccess.database_delete(connectionsTable, key);
}

export async function socket_connect (connectionId: string)
{
  const item = 
  {
      id: connectionId
  }
  await todoAccess.database_create(connectionsTable, item);
}

export async function socket_scan ()
{
  return todoAccess.database_scan (connectionsTable);
}