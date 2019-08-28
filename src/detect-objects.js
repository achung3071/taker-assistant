//MAKE PREDICTIONS FOR SPECIFIED IMAGE
function getEndpoints() {
  let pullParams = {
    FunctionName: 'list_endpoints',
    InvocationType: 'RequestResponse',
    LogType: 'None'
  };
  return new Promise((resolve, reject) => {
    lambda.invoke(pullParams, function (err, data) {
      if (err) {
        reject('There was an error listing endpoints: ' + err.message);
      } else {
        resolve(JSON.parse(data.Payload));
      }
    });
  });
}

function openPredsModal() {
  let loadedSelectors = 0;
  let currImageName = allSlides[current].name;
  let endpointSelector = document.querySelector('.make-preds .list-endpoints');
  let predImageSelector = document.querySelector('.make-preds .select-image');
  getEndpoints().then(resp => {
    if (resp.Endpoints.length === 0) return alert('No endpoints in service.');
    resp.Endpoints.forEach(endpoint => {
      endpointSelector.innerHTML += `<option class="endpoint">${endpoint.EndpointName}</option>`;
    }); //List the endpoints stored in sagemaker
    loadedSelectors++;
    if (loadedSelectors === 2) document.querySelector('.bg-modal.make-preds').style.display = 'block';
  }).catch(err => alert(err));
  s3.listObjects({}, function (err, data) {
    if (err) return alert('An error occurred while looking for S3 images: ' + err.message);
    let matchingImgs = data.Contents.filter(obj => {
      return obj.Key.split('/').slice(-1)[0] === currImageName;
    });
    if (matchingImgs.length === 0) {
      return alert('No images in S3 that match the current image.');
    }
    matchingImgs.forEach(obj => {
      predImageSelector.innerHTML += `<option class="img-listing">${obj.Key}</option>`;
    }); //list images with matching name in S3 bucket
    loadedSelectors++;
    if (loadedSelectors === 2) document.querySelector('.bg-modal.make-preds').style.display = 'block';
  });
}

function closePredsModal() {
  let endpointSelector = document.querySelector('.make-preds .list-endpoints');
  let predImageSelector = document.querySelector('.make-preds .select-image');
  Array.from(endpointSelector.children).forEach((e, i) => {
    if (i !== 0) endpointSelector.removeChild(e); //remove endpoint listings
  });
  predImageSelector.innerHTML = ''; //remove image listings
  document.querySelector('.bg-modal.make-preds').style.display = 'none';
}

function getPredictionScores() {
  let endpointSelector = document.querySelector('.make-preds .list-endpoints');
  let predImageSelector = document.querySelector('.make-preds .select-image');
  let thresholdSelector = document.querySelector('.select-threshold');
  let endpoint = endpointSelector.options[endpointSelector.selectedIndex].text;
  let imagePath = predImageSelector.options[predImageSelector.selectedIndex].text;
  let threshold = thresholdSelector.options[thresholdSelector.selectedIndex].text;
  let pullParams = {
    FunctionName: 'detect_objects',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({ endpoint, imagePath }),
    LogType: 'None'
  };
  return new Promise((resolve, reject) => {
    if (endpoint === 'Select Endpoint' || threshold === 'Threshold Score') {
      reject('Please specify all fields.');
      return;
    }
    lambda.invoke(pullParams, function (err, data) {
      if (err) {
        reject('There was an error while getting predictions: ' + err.message);
      } else {
        resolve(JSON.parse(data.Payload));
      }
    });
  });
}

function makeInference() {
  getPredictionScores().then(data => {
    let predictions = JSON.parse(data.body).prediction;
    let validPreds = predictions.filter(objectData => {
      let score = objectData[1];
      let thresholdSel = document.querySelector('.select-threshold');
      let threshold = parseFloat(thresholdSel.options[thresholdSel.selectedIndex].text);
      return score >= threshold; //threshold confidence score
    });
    allSlides[current].style.display = 'none';
    //Create new canvas for prediction image
    let imgCanvas = document.createElement('canvas');
    let imgCtx = imgCanvas.getContext('2d');
    imgCanvas.width = currCanvasState.image.width;
    imgCanvas.height = currCanvasState.image.height;
    imgCtx.drawImage(currCanvasState.image, 0, 0);
    //Draw transparent rectangle to add dark filtering
    imgCtx.globalAlpha = 0.3;
    imgCtx.filLStyle = 'black';
    imgCtx.fillRect(0, 0, imgCanvas.width, imgCanvas.height);
    imgCtx.globalAlpha = 1.0;
    //Add circles to identify objects
    let circles = [];
    for (let i = 0; i < validPreds.length; i++) {
      let pred = validPreds[i];
      let [x0, y0, x1, y1] = pred.slice(2);
      let centerX = imgCanvas.width * ((x0 + x1) / 2);
      let centerY = imgCanvas.height * ((y0 + y1) / 2);
      circles.push([centerX, centerY]); //record circle centers for tooltip
      imgCtx.beginPath();
      imgCtx.arc(centerX, centerY, 10, 2 * Math.PI, false);
      imgCtx.fillStyle = 'white';
      imgCtx.fill();
      imgCtx.lineWidth = 0.5;
      imgCtx.strokeStyle = 'black';
      imgCtx.stroke();
    };
    imgCanvas.className = 'pred-image'; //add pred img styling
    document.querySelector('.slider').appendChild(imgCanvas);
    //Add description on hover to identify labels and scores
    let description = document.createElement('div');
    description.className = 'label-description'; //add formatting
    document.querySelector('.slider').appendChild(description);
    let labels = validPreds.map(objectData => classes[objectData[0]]);
    let scores = validPreds.map(objectData => objectData[1]);
    let predImage = document.querySelector('.pred-image')
    predImage.addEventListener('mousemove', e => {
      let bbox = predImage.getBoundingClientRect();
      let offsetX = bbox.left;
      let offsetY = bbox.top;
      let [mx, my] = [e.clientX - offsetX, e.clientY - offsetY];
      const radius = 10;
      let labelInfo = document.querySelector('.label-description');
      for (let i = circles.length - 1; i >= 0; i--) {
        let circle = circles[i]
        let distFromCenter = Math.pow(Math.pow(mx - circle[0], 2) + Math.pow(my - circle[1], 2), 0.5);
        if (distFromCenter < radius) {
          predImage.style.cursor = 'pointer';
          labelInfo.innerHTML = `Class: ${labels[i]}<br>Score: ${scores[i]}`;
          labelInfo.style.display = 'block';
          return;
        }
      }
      predImage.style.cursor = 'default';
      labelInfo.style.display = 'none'; //Does not hover over a circle
    });
    document.querySelector('#clear-predictions').style.display = 'block';
    document.querySelector('#get-predictions').style.display = 'none';
    closePredsModal();
  }).catch(err => alert(err));
}

//Clear predictions when pressing button
function clearPreds() {
  let predImage = document.querySelector('.pred-image');
  let labelInfo = document.querySelector('.label-description');
  let slider = document.querySelector('.slider');
  slider.removeChild(predImage);
  slider.removeChild(labelInfo);
  document.querySelector('#get-predictions').style.display = 'block';
  document.querySelector('#clear-predictions').style.display = 'none';
  allSlides[current].style.display = 'block';
}