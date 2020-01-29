/** This file contains all the Data Layer calls to TODO functions.
 * All calls are AWS specific and would need to be changed in if 
 * one wants to utilise code portability. 
 */

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const XAWS = AWSXRay.captureAWS(AWS);
import { createLogger } from '../utils/logger'

const logger = createLogger('todo');

export class ChatAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly connectionsTable = process.env.CONNECTIONS_TABLE) {}

  async websocket_create ()  
  {
    this.connectionsTable;
  }

  async database_create (Item)
  {
    logger.info('Deleting item from database');
    await this.docClient.put({
      TableName: this.connectionsTable,
      Item
    }).promise()
  }

  async database_delete (Key)
  {
    await this.docClient.delete({
      TableName: this.connectionsTable,
      Key
    }).promise();
  }

  async database_scan ()
  {
    const connections = await this.docClient.scan(
    {
       TableName: this.connectionsTable,
       ProjectionExpression: 'id'
    }).promise();
    return connections;
  }

  async updateChatAlias ( id: string,
                          // topic: string,
                          alias: string)
  {
    return await this.docClient.update (
    {
      TableName: this.connectionsTable,
      Key :
      {
        'id': id,
        // 'topic': topic
      },
      UpdateExpression: 'set #alias = :a',
      ExpressionAttributeNames:
      {
        '#alias' : 'alias',
      },
      ExpressionAttributeValues:
      {
        ':a': alias
      },
      ReturnValues:"UPDATED_NEW"
    }).promise();
  }

  async updateChatTopic ( id: string,  topic: string)
  {
    return await this.docClient.update (
    {
      TableName: this.connectionsTable,
      Key :
      {
        'id': id,
        // 'topic': topic
      },
      UpdateExpression: 'set #topic = :t',
      ExpressionAttributeNames:
      {
        '#topic' : 'topic',
      },
      ExpressionAttributeValues:
      {
        ':t': topic
      },
      ReturnValues:"UPDATED_NEW"
      }).promise();
    }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}