import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DeleteObjectOutput} from 'aws-sdk/clients/s3'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const XAWS = AWSXRay.captureAWS(AWS);
const s3 = new AWS.S3({signatureVersion: 'v4'});
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('todo');

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODO_TABLE) {
  }

  async getTodoList(userId: string): Promise<TodoItem[]> 
  {
    logger.info('Getting all TODO items for current user');
    const result = 
    await this.docClient
      .query({
        TableName: this.todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: 
        {
          ':userId': userId
        }
      }).promise();
    const items = result.Items;
    return items as TodoItem[];
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise();
    return todo;
  }

  async updateTodoItem (
    todo: TodoUpdate,
    todoId: string,
    userId: string)
  {
    await this.docClient.update (
      {
        TableName: this.todoTable,
        Key :
        {
          'userId': userId,
          'todoId': todoId
        },
        UpdateExpression: 'set #name = :n, dueDate = :dd, done = :d',
        ExpressionAttributeNames:
        {
          '#name' : 'name',
        },
        ExpressionAttributeValues:
        {
          ':n': todo.name,
          ':dd': todo.dueDate,
          ':d': todo.done,
        },
        ReturnValues:"UPDATED_NEW"
      }).promise();
  }
  
  async updateTodoItemAttachment (
    attachmentUrl: string,
    todoId: string,
    userId: string)
  {
    await this.docClient.update (
      {
        TableName: this.todoTable,
        Key :
        {
          'userId': userId,
          'todoId': todoId
        },
        UpdateExpression: 'set attachmentUrl = :url',
        ExpressionAttributeValues:
        {
          ':url': attachmentUrl
        },
        ReturnValues:"UPDATED_NEW"
      }).promise();
  }

  async getTodoItem (todoId: string, userId: string) : Promise <TodoItem>
  {
    const result = await this.docClient
    .query({
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId, todoId = :todoId',
      ExpressionAttributeValues: 
      {
        ':userId': userId,
        ':todoId': todoId
      }
    }).promise();
    return result.Items[0] as TodoItem;
  }

  async deleteTodoItemAttachment (todoId: string): Promise<DeleteObjectOutput>
  {
    return await s3.deleteObject(
      {
        Bucket: this.todoTable, 
        Key: todoId
      }).promise();
  }

  async deleteTodoItem (todoId: string, userId: string)
  {
    // // Get the TODO item
    // const result = await this.getTodoItem (todoId, userId);
    // console.log ('Todo Found: ' + result);
    // // If an attachment exists, then we delete it
    // if (typeof(result.attachmentUrl === "undefined"))
    // {
    //   await this.deleteTodoItemAttachment (todoId);
    // }
    await this.docClient.delete (
      {
        TableName: this.todoTable,
        Key : 
        {
          "userId": userId,
          "todoId": todoId
        }
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