//CREATE ENDPOINT FOR MODEL DEPLOYMENT & PREDICTIONS
function openEndpointModal() {
  s3.listObjects({}, function (err, data) {
    if (err) {
      return alert('There was an error while listing models: ' + err.message);
    }
    let models = data.Contents.filter(function (obj) {
      return (obj.Key.includes('models/') && obj.Key.includes('.tar.gz'));
    }); //only show model files in the bucket
    if (models === undefined || models.length === 0) {
      return alert('There are no stored models.');
    }
    let modelSelector = document.querySelector('.select-model .list-models');
    models.forEach(function (obj) {
      modelSelector.innerHTML += `<option class="model">${obj.Key}</option>`;
    }); //list the models stored in the s3 bucket
    document.querySelector('.bg-modal.select-model').style.display = 'block'; //show popup
  });
}

function closeEndpointModal() {
  let modelSelector = document.querySelector('.select-model .list-models');
  Array.from(modelSelector.children).forEach((e, i) => {
    if (i !== 0) modelSelector.removeChild(e); //remove model listings
  });
  document.querySelector('.bg-modal.select-model').style.display = 'none';
}

function createEndpoint() {
  let modelSelector = document.querySelector('.select-model .list-models');
  let modelPath = modelSelector.options[modelSelector.selectedIndex].text;
  let endpointName = document.querySelector('.select-model .endpoint-name').value;
  if (modelPath === 'Model File' || endpointName === '') {
    return alert('Please specify all fields.');
  }
  let pullParams = {
    FunctionName: 'create_endpoint',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({ modelPath, endpointName }),
    LogType: 'None'
  };
  lambda.invoke(pullParams, function (err, data) {
    if (err) {
      alert('There was an error while creating endpoint: ' + err.message);
    } else {
      alert('Creating endpoint.');
    }
  });
  closeEndpointModal(); //close window after invoke
}