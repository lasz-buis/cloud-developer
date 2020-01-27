import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodoItem } from '../../businessLogic/todos'

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  // Extract the User ID from the JWT
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  // create a new TODO item with User and TODO ID's
  const item = await createTodoItem(newTodo, jwtToken)
  return {
    statusCode: 201,
    body: JSON.stringify({item})
  };
});

handler.use(
  cors({
    credentials: true
  })
)
