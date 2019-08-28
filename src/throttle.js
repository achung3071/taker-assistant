//Throttle function for debugging multiple clicks
let throttle = (fn, delay) => {
  let canCall = true;
  return (...args) => {
    if (canCall) {
      fn.apply(null, args);
      canCall = false;
      setTimeout(() => {
        canCall = true;
      }, delay);
    }
  }
}