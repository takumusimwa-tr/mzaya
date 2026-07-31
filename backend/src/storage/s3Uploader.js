const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const {
  getSignedUrl,
} = require('@aws-sdk/s3-request-presigner');

const client = new S3Client({
  region: process.env.AWS_REGION,
});

const bucket = process.env.MEDIA_BUCKET;

async function putBuffer({ key, buffer, contentType }) {
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  }));

  return { key, byteSize: buffer.length };
}

async function removeObject(key) {
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  }));
}

async function objectExists(key) {
  try {
    await client.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    }));
    return true;
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404) return false;
    throw error;
  }
}

async function createReadUrl(key, expiresIn = 300) {
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn }
  );
}

module.exports = {
  putBuffer,
  removeObject,
  objectExists,
  createReadUrl,
};
