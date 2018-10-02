var isOpen = true;

function setDarkTheme() {
  // Remove active class from light theme
  document.querySelector('.color-select.light').classList.remove('active');
  // Hide light themed content and show dark
  const elem = document.querySelector('.fs-select-container');
  elem.classList.remove('light');
  elem.classList.add('dark');
}


function setLightTheme() {
  // Remove active class from dark theme
  document.querySelector('.color-select.dark').classList.remove('active');
  // Hide dark themed content and show light
  const elem = document.querySelector('.fs-select-container');
  elem.classList.remove('dark');
  elem.classList.add('light');
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
  // Add color change toggle listeners to color-selects
  var cs = document.getElementsByClassName('color-select');
  for (var i = 0; i < cs.length; i++) {
    cs[i].addEventListener('click', handleColorSelect);
  }
});
