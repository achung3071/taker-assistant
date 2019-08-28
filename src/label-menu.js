//MANAGE LABEL MENU (RIGHT SIDE) AND MODAL
function accordionMenuInit() { //initialize accordion menu
  let accordions = document.querySelectorAll('.accordion');
  for (let i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener('click', () => {
      accordions[i].classList.toggle('is-open');
      let content = accordions[i].nextElementSibling;
      if (content.style.maxHeight !== '0px') { //if maxHeight is not 0
        content.style.maxHeight = '0px'; //close menu
      } else {
        //scrollHeight gets the height of the content
        content.style.maxHeight = '';
      }
    });
  }
}

function onFileClick() {
  let fileList = document.querySelector('#file-menu .list-items');
  //Change photo on new file selection (if not in pred mode)
  if (allSlides[current].style.display === 'block') {
    reset(); // do not show all slides
    current = fileList.selectedIndex; // index of new current slide
    currCanvasState = canvasStates[current];
    allSlides[current].style.display = 'block';
    refreshLabels();
  }
};

function onLabelClick() {
  let labelList = document.querySelector('#labels-menu .list-items');
  currCanvasState.selection = currCanvasState.shapes[labelList.selectedIndex];
  currCanvasState.selectionIndex = labelList.selectedIndex;
  currCanvasState.valid = false; //update to show new selection on canvas
}

function onLabelDblClick() {
  let labelList = document.querySelector('#labels-menu .list-items');
  if (labelList.selectedIndex !== -1) { //if some label is selected
    currCanvasState.editMode = true; //popup will edit the selected label
    document.querySelector('.bg-modal.create-label').style.display = 'block'; //open popup
    document.querySelector('.create-label .label-input').select(); //keep input selected
  }
}

function onPopupLabelClick() {
  let labelInput = document.querySelector('.create-label .label-input');
  let popupLabelList = document.querySelector('.create-label .label-list');
  labelInput.value = popupLabelList.options[popupLabelList.selectedIndex].innerText;
}

function confirmLabel() { //add label to list on right
  let labelInput = document.querySelector('.create-label .label-input');
  let modalBackground = document.querySelector('.bg-modal.create-label');
  let labelList = document.querySelector('#labels-menu .list-items');
  let popupLabelList = document.querySelector('.create-label .label-list');
  if (currCanvasState.editMode) {
    let labelIndex = document.querySelector('#labels-menu .list-items').selectedIndex;
    currCanvasState.labels[labelIndex] = labelInput.value; //change label
    labelList.querySelectorAll('option')[labelIndex].innerText = labelInput.value;
    currCanvasState.editMode = false; //no longer editing
  } else {
    labelList.innerHTML += `<option class="list-item">${labelInput.value}</option>`;
    currCanvasState.labels.push(labelInput.value);
    //Update color of annotation label options
    let label = Array.from(labelList.querySelectorAll('.list-item')).slice(-1)[0];
    let prevColorIndex = (currCanvasState.colorIndex === 0) ? 4 : currCanvasState.colorIndex - 1;
    label.style.backgroundColor = currCanvasState.colors[prevColorIndex];
  }
  let labeledBefore = Array.from(popupLabelList.options).reduce((accum, label) => {
    return (accum || label.innerText === labelInput.value);
  }, false); //Add to popup if the label did not exist before
  if (!labeledBefore) {
    popupLabelList.innerHTML += `<option class="list-item">${labelInput.value}</option>`;
  }
  modalBackground.style.display = 'none';
}

function cancelLabel() { //stop current bounding box from being labeled
  let modalBackground = document.querySelector('.bg-modal.create-label');
  modalBackground.style.display = 'none';
  if (!currCanvasState.editMode) {
    currCanvasState.shapes.pop(); //delete most recent bbox
    currCanvasState.valid = false; //update canvas
  }
  currCanvasState.editMode = false; //no longer editing
}