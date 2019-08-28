//EXECUTE FUNCTIONS ON WINDOW LOAD
window.addEventListener('load', () => {
  //UI Elements Setup
  resizeContent();
  window.addEventListener('resize', resizeContent);
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