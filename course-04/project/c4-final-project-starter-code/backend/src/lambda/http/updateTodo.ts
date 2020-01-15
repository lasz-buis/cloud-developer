import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { updateTodoItem    } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  // Extract the TODO ID from the path
  const todoId: string  = event.pathParameters.todoId;
  // Extract the new TODO attributes from the request body
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  // Extract the User ID from the JWT
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  // update TODO item for specified user
  await updateTodoItem (updatedTodo, todoId, jwtToken);
  return {
    statusCode: 200,
    body: 'Successfully Updated'
  }
  return undefined
});

handler.use(cors({credentials: true}));
