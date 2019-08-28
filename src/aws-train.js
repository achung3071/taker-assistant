//CREATE SAGEMAKER TRAINING JOB
function openParamsModal() {
  document.querySelector('.bg-modal.training-params').style.display = 'block';
}

function closeParamsModal() {
  document.querySelector('.bg-modal.training-params').style.display = 'none';
}

function trainingParamsModal() {
  let lrSelector = document.querySelector('.training-params .learning-rate');
  let epochSelector = document.querySelector('.training-params .epochs');
  let batchSelector = document.querySelector('.training-params .batch-size');
  let learningRate = lrSelector.options[lrSelector.selectedIndex].text;
  let epochs = epochSelector.options[epochSelector.selectedIndex].text;
  let batchSize = batchSelector.options[batchSelector.selectedIndex].text;
  let trainingJobName = document.querySelector('.training-job-name').value;
  return new Promise((resolve, reject) => {
    if (learningRate === 'Learning Rate' || epochs === 'Epochs' || batchSize === 'Batch Size' || trainingJobName === '') {
      reject('Please specify all fields.');
      return;
    }
    s3.listObjects({}, function (err, data) {
      if (err) {
        reject('There was an error checking for S3 data: ' + err.message);
        return;
      }
      let trainingSamples = data.Contents.filter(function (obj) {
        return (obj.Key.includes('train/') && obj.Key.includes('.jpg'));
      });
      if (batchSize === 'Max') {
        let validationSamples = data.Contents.filter(function (obj) {
          return (obj.Key.includes('validation/') && obj.Key.includes('.jpg'));
        }); // Batch size cannot be greater than validation sample number
        batchSize = validationSamples.length.toString();
      }
      let numSamples = trainingSamples.length.toString();
      resolve({
        learningRate,
        epochs,
        batchSize,
        trainingJobName,
        numSamples
      });
    });
  });
}

function createTrainingJob() {
  trainingParamsModal().then(params => {
    let pullParams = {
      FunctionName: 'train_model',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(params),
      LogType: 'None'
    };
    lambda.invoke(pullParams, function (err, data) {
      if (err) {
        alert('There was an error: ' + err.message);
      } else if (JSON.parse(data.Payload).TrainingJobArn) {
        alert('Successfully created training job.')
      }
    });
    closeParamsModal(); //close window after invoke
  }).catch(err => alert(err));
}