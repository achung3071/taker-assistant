//ACCESS TO AWS S3 AND LAMBDA
let bucketRegion = 'us-east-1';
let IdentityPoolId = 'us-east-1:0afdcf18-fa24-445e-9054-a5cd77950a89';
AWS.config.region = bucketRegion;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId });
let s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket: 'sagemaker-taker-assistant' }
});
let lambda = new AWS.Lambda({
  apiVersion: '2015-03-31'
});