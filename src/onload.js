//EXECUTE FUNCTIONS ON WINDOW LOAD
window.addEventListener('load', () => {
  //UI Elements Setup
  resizeContent();
  window.addEventListener('resize', resizeContent);
  document.querySelector('.confirm-label').addEventListener('click', confirmLabel);
  document.querySelector('.cancel-label').addEventListener('click', cancelLabel);
  document.querySelector('#cancel-training-job').addEventListener('click', closeParamsModal);
  document.querySelector('#submit-training-job').addEventListener('click', throttle(createTrainingJob, 7000));
  document.querySelector('#cancel-endpoint').addEventListener('click', closeEndpointModal);
  document.querySelector('#submit-endpoint').addEventListener('click', throttle(createEndpoint, 7000));
  document.querySelector('#cancel-prediction').addEventListener('click', closePredsModal);
  document.querySelector('#submit-prediction').addEventListener('click', throttle(makeInference, 7000));
  //File and slider loading
  document.querySelector('#file-load').addEventListener('change', fileLoader.bind(null, 'file'));
  document.querySelector('#directory-load').addEventListener('change', fileLoader.bind(null, 'directory'));
  document.addEventListener('keyup', e => {
    let popupsInvisible = true;
    document.querySelectorAll('.bg-modal').forEach(modal => {
      popupsInvisible = (popupsInvisible && modal.style.display !== 'block');
    });
    if (popupsInvisible) { //if modals are not displayed
      if (e.keyCode === 65) document.querySelector('#prev-image').click(); //a
      else if (e.keyCode === 68) document.querySelector('#next-image').click(); //d
    }
  });
});

//Resize content div (under header)
function resizeContent() {
  let elContent = document.querySelector("#content");
  elContent.style.height = `${window.innerHeight - elContent.offsetTop - 10}px`;
}