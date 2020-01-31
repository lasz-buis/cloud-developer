/** This file contains all the Data Layer calls to TODO functions.
 * All calls are AWS specific and would need to be changed in if 
 * one wants to utilise code portability. 
 */

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const XAWS = AWSXRay.captureAWS(AWS);

export class ChatAccess 
{
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly connectionsTable = process.env.CONNECTIONS_TABLE) {}

    async websocket_create ()  
    {
        this.connectionsTable;
    }

    async database_create (Item)
    {
        console.log ("DATA LAYER: database_create called");
        await this.docClient.put({
        TableName: this.connectionsTable,
        Item
        }).promise()
    }

    async database_delete (Key)
    {
        console.log ("DATA LAYER: database_delete called");
        await this.docClient.delete({
        TableName: this.connectionsTable,
        Key
        }).promise();
    }

    async database_scan ()
    {
        console.log ("DATA LAYER: database_scan called");
        const connections = await this.docClient.scan(
        {
            TableName: this.connectionsTable,
            ProjectionExpression: 'id'
        }).promise();
        return connections;
    }

    async updateChatAlias ( id: string, alias: string)
    {
        console.log ("DATA LAYER: updateChatAlias called");
        const result = await this.docClient.update (
        {
            TableName: this.connectionsTable,
            Key :
            {
                'id': id,
            },
        UpdateExpression: 'set alias = :a',
        ExpressionAttributeValues:
        {
            ':a': alias
        },
        ReturnValues:"UPDATED_NEW"
        }).promise();
        console.log ("Alias Update Result:" + JSON.stringify(result));
        return result;
    }

    async updateChatTopic ( id: string,  topic: string)
    {
        console.log ("DATA LAYER: updateChatTopic called");
        const result = await this.docClient.update (
        {
            TableName: this.connectionsTable,
            Key :
            {
                'id': id,
            },
        UpdateExpression: 'set topic = :t',
        ExpressionAttributeValues:
        {
            ':t': topic
        },
        ReturnValues:"UPDATED_NEW"
        }).promise();
        console.log ("Topic Update Result:" + JSON.stringify(result));
        return result;
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