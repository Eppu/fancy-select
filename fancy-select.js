// Get closest parent element by selector
// https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
var getClosest = function (elem, selector) {

  // Element.matches() polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) { }
        return i > -1;
      };
  }

  // Get the closest matching element
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (elem.matches(selector)) return elem;
  }
  return null;

};


window.docReady(function() {
  // Toggle active class.
  function toggleActive() {
    this.classList.toggle('fs-active');
  }

  var className = 'fs-select';

  // Toggle '.fs-select' active state when it is clicked.
  var fs_elements = document.getElementsByClassName(className);
  if (fs_elements && typeof fs_elements !== 'undefined') {
    for (var i = 0; i < fs_elements.length; i++) {
      // Add click and keydown event listeners.
      fs_elements[i].onclick = toggleActive;
      fs_elements[i].keydown = toggleActive;
    }
  } else {
    console.log('Could not find any elements with class name ' + className);
  }


  function handleSelect() {
    updateSelect(this);
    updatePlaceholders();
  }

  // Update select element value
  function updateSelect(elem) {
    // Get select element's name from parent
    var name = getClosest(elem, '.fs-select').attributes['data-name'].value;
    // Get selected item value
    var value = elem.attributes['data-value'].value;

    // Update all select elements with matching names to the new value
    var selects = document.getElementsByName(name);
    for (var i = 0; i < selects.length; i++) {
      selects[i].querySelector('option[value="' + value + '"]').selected = true;
    }
  }

  /**
   * Update placeholder texts to reflect their respective <select> elements.
   */
  function updatePlaceholders() {
    // Get a list of all placeholder elements
    var placeholders = document.getElementsByClassName('fs-placeholder');

    for (var i = 0; i < placeholders.length; i++) {
      // Get the .fs-select parent element
      var parent = getClosest(placeholders[i], '.fs-select');

      // Get data-name attribute value from .fs-select element
      var dataName = parent.attributes['data-name'].value;

      // Use data-name to find the correct <select> element and its currently selected option's text
      var selectElement = document.getElementsByName(dataName)[0];
      var selectValue = selectElement.options[selectElement.selectedIndex].innerText;

      // Update placeholder with newly found text
      placeholders[i].innerHTML = selectValue;
    }
  }



  // Update placeholder texts to select element values
  updatePlaceholders();

  // Add event listeners to <select> elements just in case the user manages to change them.
  var selectElements = document.getElementsByClassName('fs-select-origin');
  for (var i = 0; i < selectElements.length; i++) {
    selectElements[i].onchange = updatePlaceholders;
  }

  // When a <li> element is clicked
  // Find all .fs-options-list elements
  var listElements = document.querySelectorAll('.fs-options-list li');
  for (var i = 0; i < listElements.length; i++) {
    // Add click and keydown handlers
    listElements[i].onclick = handleSelect;
    listElements[i].keydown = handleSelect;
  }  
});
