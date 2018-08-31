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

      // Update styling on the <li> element if it matches the current value
      var listElements = parent.querySelectorAll('.fs-options .fs-options-list li');
      for (var j = 0; j < listElements.length; j++) {
        if (listElements[j].textContent === selectValue) {
          listElements[j].style.color = '#777777';
        } else {
          listElements[j].removeAttribute('style');
        }
      }
    }
  }

  /**
   * Initialize all fancy-select element sizes.
   * - Width is calculated from the data-width property set in each element
   * - Height is calculated from the number of options each element has
   */
  function initializeSelectSizes() {
    /* WIDTH */
    // Set fancy-select element widths from their data-width properties
    var fancySelects = document.getElementsByClassName('fs-select');
    for (var i = 0; i < fancySelects.length; i++) {
      // Read target width from data-width attribute
      var targetWidth = fancySelects[i].attributes['data-width'].value;

      // Apply width as a style
      fancySelects[i].style.width = targetWidth + 'em';
    }

    /* HEIGHT */
    // Set how high each .fs-select::before element is based on how many options it contains
    // Start by dynamically creating an empty stylesheet at the document head
    var styleElem = document.head.appendChild(document.createElement('style'));

    // Then loop through all the fancy-selects
    for (var i = 0; i < fancySelects.length; i++) {
      var current = fancySelects[i];
      // Count number of list elements it has as children
      var count = current.querySelectorAll('.fs-options .fs-options-list li').length;
      
      // Give the current fancy-select a unique ID
      var id = 'fs-unique-' + i;
      // To make sure the ID is unique, keep giving it a suffix number until no similar ids are found within the document
      var iteration = 0;
      while (document.getElementById(id) !== null) {
        id = 'fs-unique-' + i + '-' + iteration;
      }
      current.setAttribute('id', id);

      // Add an entry to our new stylesheet (in the page head) concerning the ::before element of our fancy-select
      var activeWidth = 1;
      var activeHeight = count / 1.25;
      var selector = '#' + id + '.fs-active::before';
      var style = '{ transform: scale(' + activeWidth +', ' + activeHeight + '); }'
      styleElem.innerHTML = styleElem.innerHTML + selector + style;
    }
  }


  // Initialize fancy-select element sizes
  initializeSelectSizes();

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
