var isOpen = true;

function toggleNativeSelect() {
  if (isOpen) {
    document.getElementById('native-select').setAttribute('style', 'display: none');
    isOpen = false;
  } else {
    document.getElementById('native-select').setAttribute('style', 'display: block');
    isOpen = true;
  }
}


function setDarkTheme() {
  // Remove active class from light theme
  document.querySelector('.color-select.light').classList.remove('active');
  // Hide light themed content and show dark
  document.querySelector('.fs-select-container.light').setAttribute('style', 'display: none;');
  document.querySelector('.fs-select-container.dark').setAttribute('style', 'display: block;');
}


function setLightTheme() {
  // Remove active class from dark theme
  document.querySelector('.color-select.dark').classList.remove('active');
  // Hide dark themed content and show light
  document.querySelector('.fs-select-container.dark').setAttribute('style', 'display: none;');
  document.querySelector('.fs-select-container.light').setAttribute('style', 'display: block;');
}


function handleColorSelect(event) {
  // Event is a mouse click event. We want to manipulate its target.
  var elem = event.target;

  // If selecting an already selected element, do nothing.
  if (elem.classList.contains('active')) return false;

  if (elem.classList.contains('dark')) {
    setDarkTheme();
  } else {
    setLightTheme();
  }
  // Set new element as active
  elem.classList.add('active');
}


window.docReady(function () {
  // Add debug toggle listener to h1
  var h1 = document.getElementsByTagName('h1')[0];
  h1.addEventListener('click', toggleNativeSelect);

  // Hide debug thing by default
  toggleNativeSelect();

  // Add color change toggle listeners to color-selects
  var cs = document.getElementsByClassName('color-select');
  for (var i = 0; i < cs.length; i++) {
    cs[i].addEventListener('click', handleColorSelect);
  }

  // Update color selection once
  var theme = document.querySelector('.color-select.active');
  if (theme.classList.contains('dark')) {
    setDarkTheme();
  } else {
    setLightTheme();
  }
});
