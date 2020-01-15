import 'source-map-support/register'
import { deleteTodoItem } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  const todoId = event.pathParameters.todoId
  await deleteTodoItem(todoId, jwtToken);
  return {
    statusCode: 201,
    body: 'Successfully deleted item'
  };
});

handler.use(cors({credentials: true}));
