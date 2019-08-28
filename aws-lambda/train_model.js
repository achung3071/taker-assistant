let AWS = require('aws-sdk');
let sagemaker = new AWS.SageMaker({
  apiVersion: '2017-07-24'
});

exports.handler = async (event) => {
  let params = {
    AlgorithmSpecification: {
      TrainingInputMode: 'File',
      TrainingImage: '811284229777.dkr.ecr.us-east-1.amazonaws.com/object-detection:latest'
    },
    HyperParameters: {
      base_network: 'resnet-50',
      use_pretrained_model: '1',
      num_classes: '67',
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
            S3Uri: 's3://sagemaker-taker-assistant/train',
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
            S3Uri: 's3://sagemaker-taker-assistant/train_annotation',
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
            S3Uri: 's3://sagemaker-taker-assistant/validation',
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
            S3Uri: 's3://sagemaker-taker-assistant/validation_annotation',
            S3DataDistributionType: 'FullyReplicated'
          }
        },
        ContentType: 'image/jpeg',
      }
    ],
    OutputDataConfig: { S3OutputPath: 's3://sagemaker-taker-assistant/models' },
    ResourceConfig: {
      InstanceCount: 1,
      InstanceType: 'ml.p2.xlarge',
      VolumeSizeInGB: 2
    },
    RoleArn: 'arn:aws:iam::145936394697:role/AWSGlueServiceSageMakerNotebookRole-Default',
    StoppingCondition: { MaxRuntimeInSeconds: 10000 },
    TrainingJobName: event['trainingJobName']
  };
  return new Promise((resolve, reject) => {
    sagemaker.createTrainingJob(params, function (err, data) {
      err ? reject(err, err.stack) : resolve(data);
    });
  });
};