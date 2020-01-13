import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODO_TABLE) {
  }

  async getTodoItem (): Promise <TodoItem>
  {
    /*
     console.log('Finding TODO item');
     const result = 
          await this.dynamoDBClient
            .query({
              TableName: todoTable,
              IndexName: 'index-name',
              KeyConditionExpression: 'paritionKey = :paritionKey',
              ExpressionAttributeValues: {
                ':paritionKey': partitionKeyValue
              }
            })
            .promise()
    */
    return null;
  }

  async getTodoList(userId: string): Promise<TodoItem[]> 
  {
    console.log('Getting all TODO items for current user')
    // const result = await this.docClient.scan({
    //   TableName: this.todoTable
    // }).promise();
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
        UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
        ConditionExpression: 'userId = :userId, todoId = :todoId',
        ExpressionAttributeValues:
        {
          ':name' : todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done,
        }
      }).promise();
  }

  async deleteTodoItem (todoId: string, userId: string)
  {
    await this.docClient.delete (
      {
        TableName: this.todoTable,
        Key : 
        {
          "userId": userId,
          "todoId": todoId
        },
        ExpressionAttributeNames:
        {

        },
        ExpressionAttributeValues:
        {
          
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