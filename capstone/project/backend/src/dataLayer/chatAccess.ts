/** This file contains all the Data Layer calls to TODO functions.
 * All calls are AWS specific and would need to be changed in if 
 * one wants to utilise code portability. 
 */

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS);
const domain = 'wss://3t5d4gcuz4.execute-api.us-west-2.amazonaws.com';
const stage = 'dev'
const connectionParams = 
{
    apiVersion: "2018-11-29",
    endpoint: `${domain}/${stage}`
}

export class ChatAccess 
{
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly connectionsTable = process.env.CONNECTIONS_TABLE,
        private apiGateway = new XAWS.ApiGatewayManagementApi(connectionParams)) {}

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
    
    async send (connectionId : string, data : string)
    {
        await this.apiGateway.postToConnection(
        {
            ConnectionId: connectionId,
            Data: data,
        }).promise();
    }
    
    async queryAlias (connectionId : string) : Promise <string>
    {
        const result = await this.docClient.query(
        {
            TableName: this.connectionsTable,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: 
            {
            ':id': connectionId
            }
        }).promise();
        const alias : string = result.Items[0].alias;
        console.log ('Alias Returned from database :' + alias);
        return alias;
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