import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { parseUserId } from '../../auth/utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import { TodoAccess } from '../../dataLayer/todoAccess'

// instantiate objects
const todoAccess = new TodoAccess();
const s3 = new AWS.S3({signatureVersion: 'v4'});

// const imagesTable   = process.env.IMAGES_TABLE;
const bucketName    = process.env.TODO_IMAGE_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Extract the TODO ID from the path
  const todoId = event.pathParameters.todoId
  // Extract the User ID from the JWT
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const userId = parseUserId(split[1]);
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const url : string = getUploadUrl(todoId, userId);
  // const url : string = getUploadUrl(todoId);
  return  {
    statusCode: 201,
    body: JSON.stringify(
      {
      TodoId: todoId, 
      uploadUrl: url
    })
  }
});

handler.use(cors({credentials: true}));

function getUploadUrl(todoId: string, userId : string): string {
  // update the todo item with the anticipated attachment url
  todoAccess.updateTodoItemAttachment(
    `https://${bucketName}.s3.amazonaws.com/${todoId}`,
    todoId,
    userId);
  // retrieve signed URL and return it
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}