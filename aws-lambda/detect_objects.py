import json
import boto3

def lambda_handler(event, context):
    # TODO implement
    s3 = boto3.resource('s3', region_name='us-east-1')
    bucket = s3.Bucket('sagemaker-taker-assistant')
    image_object = bucket.Object(event['imagePath'])
    image_data = image_object.get()['Body'].read()
    runtime_client = boto3.client('runtime.sagemaker')
    response = runtime_client.invoke_endpoint(EndpointName=event['endpoint'],
                                              ContentType='image/jpeg',
                                              Body=image_data)
    result = response['Body'].read().decode('ascii')
    return {
        'statusCode': 200,
        'body': result  # already in json format
    }
