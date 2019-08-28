//CANVAS SLIDER FUNCTIONS
let [allSlides, current] = [document.querySelectorAll('.slide'), 0];
function refreshLabels() { //Refreshes labels for each image
  let annotationList = document.querySelector('#labels-menu .list-items');
  annotationList.innerHTML = ''; // get rid of all pre-existing labels
  currCanvasState.labels.forEach(function (label) {
    annotationList.innerHTML += `<option class="list-item">${label}</option>`;
  });
  //Colored backgrounds corresponding to shapes
  Array.from(annotationList.options).forEach((option, i) => {
    option.style.backgroundColor = currCanvasState.shapes[i].fill;
  });
}
function reset() {
  for (let i = 0; i < allSlides.length; i++) {
    allSlides[i].style.display = 'none';
  }
}
function startSlide() { //Initializes slider
  reset(); //Do not show all slides
  allSlides[0].style.display = 'block';
  document.querySelector('#file-menu .list-items').selectedIndex = 0;
}
function slideLeft() { //Show previous slide
  reset(); // do not show all slides
  if (current === 0) { //if on the first image
    current = allSlides.length; //current is now 1 more than index of last slide
  }
  currCanvasState = canvasStates[current - 1];
  allSlides[current - 1].style.display = 'block'; // show prev slide
  document.querySelector('#file-menu .list-items').selectedIndex = current - 1;
  refreshLabels();
  current--;
}
function slideRight() { //Show next slide
  reset(); // do not show all slides
  if (current === allSlides.length - 1) { //if on the last slide
    current = -1; //current is now 1 less than index of first slide
  }
  currCanvasState = canvasStates[current + 1];
  allSlides[current + 1].style.display = 'block'; // show next slide
  document.querySelector('#file-menu .list-items').selectedIndex = current + 1;
  refreshLabels();
  current++;
}
function createSlides(numSlides) { //Create specified # of slides
  let slider = document.querySelector('.slider');
  for (let i = 0; i < numSlides; i++) {
    slider.innerHTML += '<canvas class="image-canvas slide"></canvas>';
  }
  allSlides = document.querySelectorAll('.slide'); //update allSlides
}

//FILE & CANVAS LOADING FUNCTIONS
let canvasStates = [];
let currCanvasState;
function fileLoader(fileOrDirectory) { //callback on image upload
  let imgArr;
  if (fileOrDirectory === 'file') {
    imgArr = document.querySelector('#file-load').files;
  } else if (fileOrDirectory === 'directory') {
    imgArr = document.querySelector('#directory-load').files;
  }
  createSlides(imgArr.length); //create new slides for images
  let fileList = document.querySelector('#file-menu .list-items');
  for (let i = 0; i < imgArr.length; i++) {
    let img = new Image();
    img.onload = (function (index) {
      return function () {
        let canvas = allSlides[index];
        canvas.name = imgArr[index].name;
        //Will add this option later along with canvas state
        let slider = document.querySelector('.slider');
        let wRatio = slider.offsetWidth / this.width;
        let hRatio = slider.offsetHeight / this.height;
        let ratio = Math.min(wRatio, hRatio);
        canvas.width = this.width * ratio;
        canvas.height = this.height * ratio;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0, this.width, this.height,
          0, 0, canvas.width, canvas.height);
        //Insert canvas state and file option in correct positions
        while (index >= fileList.children.length) {
          fileList.appendChild(document.createElement('option'));
        }
        while (index >= canvasStates.length) {
          canvasStates.push(null); //placeholder element
        }
        fileList.children[index].innerText = canvas.name;
        fileList.children[index].className = 'list-item';
        canvasStates[index] = new CanvasState(canvas);
        if (index === imgArr.length - 1) { //If last image has been loaded
          //Event listeners for switching slides (when not in prediction mode)
          document.querySelector('#prev-image').addEventListener('click', () => {
            if (allSlides[current].style.display === 'block') slideLeft();
          });
          document.querySelector('#next-image').addEventListener('click', () => {
            if (allSlides[current].style.display === 'block') slideRight();
          });
          currCanvasState = canvasStates[0];
          startSlide(); //Initialize the slider after load
        }
      }
    })(i); //IIFE & closure to retain original index upon image load
    img.src = URL.createObjectURL(imgArr[i]);
  }
}
