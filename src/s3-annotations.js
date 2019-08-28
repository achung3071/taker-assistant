//OBJECT DETECTION ANNOTATIONS
function getAnnotations() { //returns list of annotation objects to stringify
  let allAnnotations = [];
  let canvasses = document.querySelectorAll('canvas');
  for (let i = 0; i < canvasses.length; i++) {
    let canvas = canvasses[i];
    let canvasState = canvasStates[i];
    //Skip if there are no annotations to create
    if (canvasState.labels.length === 0) continue;
    //create variable for file name
    let file = canvas.name;
    //create variable for file size
    let image_size = [{
      width: canvas.width,
      height: canvas.height,
      depth: 3
    }];
    //create variable for categories
    let labels = canvasState.labels;
    let categories = labels.filter((name, index) => labels.indexOf(name) === index) //only unique labels
      .map(label => ({ class_id: Object.keys(classes).find(i => classes[i] === label), name: label }));
    //create variable for bounding box annotations
    let shapes = canvasState.shapes;
    let annotations = []; //describes bounding box and classes
    for (let i = 0; i < shapes.length; i++) {
      let shape = shapes[i]; //shape representing bbox
      let id = categories.find(obj => obj.name === labels[i]).class_id;
      let bbox = {};
      bbox.class_id = id;
      bbox.top = shape.y;
      bbox.left = shape.x;
      bbox.width = shape.w;
      bbox.height = shape.h;
      annotations.push(bbox);
    }
    allAnnotations.push({ file, image_size, annotations, categories });
  }
  return allAnnotations;
}

function dataURLToFile(url, fileName) { //converts dataURL into file for uploading
  let mimeType = url.substring(5).split(';')[0];
  return (fetch(url)
    .then(res => res.arrayBuffer())
    .then(buf => new File([buf], fileName, { type: mimeType }))
  );
}

async function uploadImages() {
  let canvasses = document.querySelectorAll('canvas');
  let uploadCount = 0;
  let skippedImages = 0;
  for (let i = 0; i < canvasses.length; i++) {
    //Do not upload if there are no annotations
    if (canvasStates[i].labels.length === 0) {
      uploadCount++; //Still update to check all images are uploaded
      skippedImages++;
      continue;
    }
    let canvas = canvasses[i];
    let image = canvasStates[i].image;
    let file = await dataURLToFile(image.toDataURL(), canvas.name);
    let filePath;
    if ((i - skippedImages) % 5 === 4) { //on every fifth image, test
      filePath = 'validation/' + encodeURIComponent(canvas.name);
    } else {
      filePath = 'train/' + encodeURIComponent(canvas.name);
    }
    let errorExists = false;
    s3.upload({
      Key: filePath,
      Body: file,
      ACL: 'public-read'
    }, function (err, data) {
      if (err) errorExists = true;
      uploadCount++;
      if (uploadCount === canvasses.length) alert('Images uploaded to S3.');
    });
    if (errorExists) {
      alert('There was an error uploading photos: ', err.message);
      break;
    }
  }
}

function uploadAnnotations() {
  let allAnnotations = getAnnotations(); //Only corresponds to images w/ labels
  let uploadCount = 0;
  for (let i = 0; i < allAnnotations.length; i++) {
    let annotationData = JSON.stringify(allAnnotations[i]);
    let fileName = `${allAnnotations[i].file.split('.')[0]}.json`;
    let file = new File([annotationData], fileName, {
      type: 'JSON'
    });
    let filePath;
    if (i % 5 === 4) { //on every fifth image, test
      filePath = 'validation_annotation/' + encodeURIComponent(fileName);
    } else {
      filePath = 'train_annotation/' + encodeURIComponent(fileName);
    }
    let errorExists = false;
    s3.upload({
      Key: filePath,
      Body: file,
      ACL: 'public-read'
    }, function (err, data) {
      if (err) errorExists = true;
      uploadCount++;
      if (uploadCount === allAnnotations.length) alert('Annotations uploaded to S3.');
    });
    if (errorExists) {
      alert('There was an error uploading annotations: ', err.message);
      break;
    }
  }
}