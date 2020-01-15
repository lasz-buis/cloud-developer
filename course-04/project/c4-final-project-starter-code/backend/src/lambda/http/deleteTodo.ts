import 'source-map-support/register'
import { deleteTodoItem } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => 
{
  // Extract the TODO ID from the path
  const todoId = event.pathParameters.todoId
  // Extract the User ID from the JWT
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  // Delete item from the list
  await deleteTodoItem(todoId, jwtToken);
  return {
    statusCode: 201,
    body: "{}"
  };
});

handler.use(cors({credentials: true}));
