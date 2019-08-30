import json
import boto3

def lambda_handler(event, context):
    # TODO implement
  sm = boto3.Session().client('sagemaker')
  primary_container = {
      'Image': '811284229777.dkr.ecr.us-east-1.amazonaws.com/object-detection:latest',
      # 변경: 지역이 us-east-1가 아니면 다른 지역에서 object-detection을 위한 TrainingImage을 붙여넣어야 됩니다.

      'ModelDataUrl': 's3://<버켓 이름>/' + event['modelPath'] #변경
  }
  sm.create_model(
      ModelName=event['endpointName'] + 'Model',
      ExecutionRoleArn='<sagemaker execution role ARN>', #변경
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
