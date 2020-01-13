import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

// const imagesTable   = process.env.IMAGES_TABLE;
const bucketName    = process.env.SIGNED_URL_EXPIRATION;
const urlExpiration = process.env.IMAGES_S3_BUCKET;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
  return undefined
}

function getUploadUrl(todoId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}