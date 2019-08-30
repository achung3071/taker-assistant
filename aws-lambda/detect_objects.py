import json
import boto3

def lambda_handler(event, context):
    # TODO implement
    s3 = boto3.resource('s3', region_name='<AWS region (지역 이름)>') # 변경
    bucket = s3.Bucket('<버켓 이름>') #변경
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
