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


/**
 * Add attributes to DOM elements.
 * @param {HTMLElement} element Element to which add the attribute
 * @param {string} name Attribute name
 * @param {string} value Attribute value
 */
const setAtt = (element, name, value) => {
  const att = document.createAttribute(name);
  att.value = value;
  element.setAttributeNode(att);
}


/**
 * Parse native <select> elements into JavaScript objects
 * Use __another_function__ to transform these objects into Fancy Selects
 */
const parseSelects = () => {
  // Get native <select> elements
  const nativeSelects = document.getElementsByClassName('fs-select-origin');
  const fancySelects = [];
  for (let i = 0; i < nativeSelects.length; i += 1) {
    const s = nativeSelects[i];
    /**
     * Deconstruct elements and their options into the following format
     * {
     *   name: ...,
     *   options: [
     *     ...,
     *   ],
     *   texts: [
     *     ...,
     *   ],
     *   selectedIndex: ...,
     * }
     */
    const item = {};

    // Parse element name
    try {
      item.name = s.attributes['name'].value;
    } catch (e) {
      console.log('Couldn\'t find name in the following element ', s);
      continue;
    }

    // Parse element option values and names
    try {
      const options = s.getElementsByTagName('option');
      item.options = [];
      item.texts = [];
      for (let j = 0; j < options.length; j += 1) {
        const o = options[j];
        // Copy option value and text into the object we're building
        item.options[j] = o.value;
        item.texts[j] = o.text;

        // Check if item is selected
        if (o.selected) { item.selectedIndex = j }
      }
    } catch (e) {
      console.log('Couldn\'t parse options from the following element ', s);
      continue;
    }

    // Element is not expanded by default
    item.isOpen = false;

    // Successfully built an object. Add it to an array of finished objects.
    fancySelects.push(item);
  }
  
  return {
    total: nativeSelects.length,
    success: fancySelects.length,
    items: fancySelects,
  };
}


/**
 * Create Fancy Select elements from a list of parsed <select> elements
 */
const createFancySelects = (items) => {
  for(let i = 0; i < items.length; i += 1) {
    console.log(items[i]);

    // CONTAINER
    const container = document.createElement('div');
    setAtt(container, 'class', 'fs-select'); // class
    setAtt(container, 'data-name', items[i].name) // data-name
    // Data-width
    setAtt(container, 'data-width', '7.5');


    // PLACEHOLDER
    const ph = document.createElement('span');
    setAtt(ph, 'class', 'fs-placeholder');
    
    // Set placeholder value to what is selected
    const phText = items[i].texts[items[i].selectedIndex];
    const phTextNode = document.createTextNode(phText);
  
    // Add text to placeholder
    ph.appendChild(phTextNode);

    // Add placeholder to container
    container.appendChild(ph);


    // OPTIONS LIST
    const oWrapper = document.createElement('div'); // Wrapper
    setAtt(oWrapper, 'class', 'fs-options');

    const oList = document.createElement('ul'); // UL
    setAtt(oList, 'class', 'fs-options-list');

    // Create all different options
    for(let j = 0; j < items[i].options.length; j += 1) {
      const opt = document.createElement('li');
      setAtt(opt, 'data-value', items[i].options[j]);
      try {
        // Add text to option.
        optTextNode = document.createTextNode(items[i].texts[j]);
        opt.appendChild(optTextNode);
      } catch (e) {
        console.log(`Select element named ${items[i].name} has unequal amounts of options and texts. Check that each option has a value attribute and text content.`);
      }

      // Add created <li> element to <ul> wrapper.
      oList.appendChild(opt);
    }

    oWrapper.appendChild(oList); // Add <ul> to wrapper
    container.appendChild(oWrapper); // Add options list wrapper to container

    // Add created Fancy Selects into their correct positions
    const sourceLocations = document.getElementsByName(items[i].name);
    for (let j = 0; j < sourceLocations.length; j += 1) {
      // Add Fancy Select
      sourceLocations[j].parentElement.appendChild(container);
      // Hide original <select>
      sourceLocations[j].style.display = 'none';
    }
  }
}


/**
 * Take a select elements and build a Fancy Selects from them
 */
const init = () => {
  // Parse native <select> elements into JS objects
  const { total, success, items } = parseSelects();

  // Log how many were successfully parsed
  console.log(`Found ${total} <select> elements and converted ${success} into objects.`);
  console.log(items);

  // Construct a Fancy Select element from each object
  createFancySelects(items);
}


window.docReady(function() {  
  // Initialize fancy-select
  init();

  // Initialize fancy-select element sizes
  initializeSelectSizes();

  // Update placeholder texts to select element values
  updatePlaceholders();

  // Add event listeners to <select> elements just in case the user manages to change them.
  var selectElements = document.getElementsByClassName('fs-select-origin');
  for (var i = 0; i < selectElements.length; i += 1) {
    selectElements[i].onchange = updatePlaceholders;
  }

  // When a <li> element is clicked
  // Find all .fs-options-list elements
  var listElements = document.querySelectorAll('.fs-options-list li');
  for (var i = 0; i < listElements.length; i += 1) {
    // Add click and keydown handlers
    listElements[i].onclick = handleSelect;
    listElements[i].keydown = handleSelect;
  }  




  // Toggle active class.
  function toggleActive() {
    this.classList.toggle('fs-active');
  }

  var className = 'fs-select';

  // Toggle '.fs-select' active state when it is clicked.
  var fs_elements = document.getElementsByClassName(className);
  if (fs_elements && typeof fs_elements !== 'undefined') {
    for (var i = 0; i < fs_elements.length; i += 1) {
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
    for (var i = 0; i < selects.length; i += 1) {
      selects[i].querySelector('option[value="' + value + '"]').selected = true;
    }
  }

  /**
   * Update placeholder texts to reflect their respective <select> elements.
   */
  function updatePlaceholders() {
    // Get a list of all placeholder elements
    var placeholders = document.getElementsByClassName('fs-placeholder');

    for (var i = 0; i < placeholders.length; i += 1) {
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
      for (var j = 0; j < listElements.length; j += 1) {
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
    for (var i = 0; i < fancySelects.length; i += 1) {
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
    for (var i = 0; i < fancySelects.length; i += 1) {
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
});
