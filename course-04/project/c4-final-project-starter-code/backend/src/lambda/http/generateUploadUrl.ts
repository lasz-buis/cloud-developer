import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

// const imagesTable   = process.env.IMAGES_TABLE;
const bucketName    = process.env.TODO_IMAGE_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler = middy (async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const url : string = getUploadUrl(todoId);
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

function getUploadUrl(todoId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}