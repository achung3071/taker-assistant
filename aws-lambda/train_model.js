let AWS = require('aws-sdk');
let sagemaker = new AWS.SageMaker({
  apiVersion: '2017-07-24'
});

exports.handler = async (event) => {
  let params = {
    AlgorithmSpecification: {
      TrainingInputMode: 'File',
      TrainingImage: '811284229777.dkr.ecr.us-east-1.amazonaws.com/object-detection:latest'
      // 변경: 지역이 us-east-1가 아니면 다른 지역에서 object-detection을 위한 TrainingImage을 붙여넣어야 됩니다.
    },
    HyperParameters: {
      base_network: 'resnet-50',
      use_pretrained_model: '1',
      num_classes: '67', //클래스 (object categories)의 수에 맞게 변경할 수 있습니다.
      mini_batch_size: event['batchSize'],
      epochs: event['epochs'],
      learning_rate: event['learningRate'],
      lr_scheduler_step: '10',
      lr_scheduler_factor: '0.1',
      optimizer: 'sgd',
      momentum: '0.9',
      weight_decay: '0.0005',
      overlap_threshold: '0.5',
      nms_threshold: '0.45',
      image_shape: '512',
      label_width: '600',
      num_training_samples: event['numSamples']
    },
    InputDataConfig: [
      {
        ChannelName: 'train',
        DataSource: {
          S3DataSource: {
            S3DataType: 'S3Prefix',
            S3Uri: 's3://<버켓 이름>/train', //변경
            S3DataDistributionType: 'FullyReplicated'
          }
        },
        ContentType: 'image/jpeg',
        ShuffleConfig: {
          Seed: 700
        }
      },
      {
        ChannelName: 'train_annotation',
        DataSource: {
          S3DataSource: {
            S3DataType: 'S3Prefix',
            S3Uri: 's3://<버켓 이름>/train_annotation', //변경
            S3DataDistributionType: 'FullyReplicated'
          }
        },
        ContentType: 'image/jpeg',
        ShuffleConfig: {
          Seed: 700
        }
      },
      {
        ChannelName: 'validation',
        DataSource: {
          S3DataSource: {
            S3DataType: 'S3Prefix',
            S3Uri: 's3://<버켓 이름>/validation', //변경
            S3DataDistributionType: 'FullyReplicated'
          }
        },
        ContentType: 'image/jpeg',
      },
      {
        ChannelName: 'validation_annotation',
        DataSource: {
          S3DataSource: {
            S3DataType: 'S3Prefix',
            S3Uri: 's3://<버켓 이름>/validation_annotation', //변경
            S3DataDistributionType: 'FullyReplicated'
          }
        },
        ContentType: 'image/jpeg',
      }
    ],
    OutputDataConfig: { S3OutputPath: 's3://<버켓 이름>/models' }, //변경
    ResourceConfig: {
      InstanceCount: 1,
      InstanceType: 'ml.p2.xlarge',
      VolumeSizeInGB: 2
    },
    RoleArn: '<sagemaker execution role ARN>', //변경
    StoppingCondition: { MaxRuntimeInSeconds: 10000 },
    TrainingJobName: event['trainingJobName']
  };
  return new Promise((resolve, reject) => {
    sagemaker.createTrainingJob(params, function (err, data) {
      err ? reject(err, err.stack) : resolve(data);
    });
  });
};