import json
import boto3

def lambda_handler(event, context):
    # TODO implement
  sm = boto3.Session().client('sagemaker')
  primary_container = {
      'Image': '811284229777.dkr.ecr.us-east-1.amazonaws.com/object-detection:latest',
      'ModelDataUrl': 's3://sagemaker-taker-assistant/' + event['modelPath']
  }
  sm.create_model(
      ModelName=event['endpointName'] + 'Model',
      ExecutionRoleArn='arn:aws:iam::145936394697:role/AWSGlueServiceSageMakerNotebookRole-Default',
      PrimaryContainer=primary_container)

  endpoint_config_name = event['endpointName'] + 'Config'
  sm.create_endpoint_config(
      EndpointConfigName=endpoint_config_name,
      ProductionVariants=[{
          'InstanceType': 'ml.m4.xlarge',
          'InitialVariantWeight': 1,
          'InitialInstanceCount': 1,
          'ModelName': event['endpointName'] + 'Model',
          'VariantName':'AllTraffic'}])

  endpoint_name = event['endpointName']
  sm.create_endpoint(
      EndpointName=endpoint_name,
      EndpointConfigName=endpoint_config_name)
  resp = sm.describe_endpoint(EndpointName=endpoint_name)
  return {
      'statusCode': 200,
      'body': json.dumps('Endpoint Status: ' + resp['EndpointStatus'])
  }
