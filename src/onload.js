//EXECUTE FUNCTIONS ON WINDOW LOAD
window.addEventListener('load', () => {
  //UI Elements Setup
  resizeContent();
  window.addEventListener('resize', resizeContent);
});

//Resize content div (under header)
function resizeContent() {
  let elContent = document.querySelector("#content");
  elContent.style.height = `${window.innerHeight - elContent.offsetTop - 10}px`;
}