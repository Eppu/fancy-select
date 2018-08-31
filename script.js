var isOpen = false;

function toggleNativeSelect() {
  if (isOpen) {
    document.getElementById('native-select').setAttribute('style', 'display: none');
    isOpen = false;
  } else {
    document.getElementById('native-select').setAttribute('style', 'display: block');
    isOpen = true;
  }
}

function handleColorSelect(event) {
  // Event is a mouse click event. We want to manipulate its target.
  var elem = event.target;

  // If selecting an already selected element, do nothing.
  if (elem.classList.contains('active')) return false;

  if (elem.classList.contains('dark')) {
    // Remove active class from light theme
    document.querySelector('.color-select.light').classList.remove('active');
    // Hide light themed content and show dark
    document.querySelector('.fs-select-container.light').setAttribute('style', 'display: none;');
    document.querySelector('.fs-select-container.dark').setAttribute('style', 'display: block;');
  } else {
    // Remove active class from dark theme
    document.querySelector('.color-select.dark').classList.remove('active');
    // Hide dark themed content and show light
    document.querySelector('.fs-select-container.dark').setAttribute('style', 'display: none;');
    document.querySelector('.fs-select-container.light').setAttribute('style', 'display: block;');
  }
  // Set new element as active
  elem.classList.add('active');
}

window.docReady(function () {
  // Add debug toggle listener to h1
  var h1 = document.getElementsByTagName('h1')[0];
  h1.addEventListener('click', toggleNativeSelect);

  // Add color change toggle listeners to color-selects
  var cs = document.getElementsByClassName('color-select');
  for (var i = 0; i < cs.length; i++) {
    cs[i].addEventListener('click', handleColorSelect);
  }
});
