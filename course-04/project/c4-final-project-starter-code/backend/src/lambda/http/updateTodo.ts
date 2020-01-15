import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { updateTodoItem    } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId: string  = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  console.log ('Processing event: ', event);
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  await updateTodoItem (updatedTodo, todoId, jwtToken);
  return {
    statusCode: 200,
    body: 'Successfully Updated'
  }
  return undefined
});

handler.use(cors({credentials: true}));
