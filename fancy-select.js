/**
 * FancySelect data structure with methods for getting and setting data
 * @param {string} name Element name
 * @param {array} options Option values (no spaces)
 * @param {array} texts Option texts displayed to the user
 * @param {number} selectedIndex Index of the currently selected item
 * @param {boolean} openState Is this element expanded or not
 */
function FancySelect(name, options, texts, selectedIndex, openState) {
  // Getter methods
  this.getName = () => name;
  this.getOptions = () => options;
  this.getTexts = () => texts;
  this.getSelectedIndex = () => selectedIndex;
  this.getOpenState = () => openState;

  this.getText = (index) => {
    try {
      return texts[index];
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Open this element and update visible elements accordingly.
   */
  this.open = () => {
    openState = true;

    // Open Fancy Select with this name
    const elements = document.querySelectorAll(`.fs-select[data-name="${name}"]`);
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].classList.add('fs-active');
    }
  }

  /**
   * Close this element and update visible elements accordingly.
   */
  this.close = () => {
    openState = false;

    const elements = document.querySelectorAll(`.fs-select[data-name="${name}"]`);
    for (let i = 0; i < elements.length; i += 1) {
      if (debugLevel > 2)
        console.log('Removing .fs-active from ', elements[i]);
      elements[i].classList.remove('fs-active');
    }
  }

  /**
   * Select an index and update visible elements accordingly.
   * @param {number} newIndex Index to select
   */
  this.select = (newIndex) => {
    // Check that newIndex is a valid positive integer.
    if (typeof newIndex !== 'number') throw new TypeError('Index must be a number.');
    if (newIndex < 0 || newIndex % 1 !== 0) throw new RangeError('Index must be a positive integer.');
    if (newIndex > options.length - 1) throw new RangeError(`Element does not have an option at index ${newIndex}. Maximum index is ${options.length - 1}.`);

    selectedIndex = newIndex;
    return selectedIndex;
  }
}


/**
 * Handle clicks on Fancy Selects (and other elements)
 * @param {*} event Click event
 * @param {FancySelect} item Fancy Select object respective to the element that was clicked.
 * @param {Array} fsObjects Array of Fancy Select objects.
 */
function handleClick(event, item, fsObjects) {
  event.stopPropagation();
  if (item === null) {
    // User clicked somewhere else than a Fancy Select. Close all Fancy Selects!
    for (let i = 0; i < fsObjects.length; i += 1) {
      fsObjects[i].close();
    }
  } else {
    // User clicked on a Fancy Select. We only want to open if they clicked on the placeholder.
    const isClickEvent = event.type === 'click';
    const targetIsPlaceholder = event.target.classList.contains('fs-placeholder');

    if (!isClickEvent || targetIsPlaceholder) {
      item.open();

      if(event.type === 'focus') {
        // Set focus on the currently selected option
        const options = document.querySelectorAll(`.fs-select[data-name="${item.getName()}"] .fs-options-list li`);
        // console.log('Setting focus on' + item.getSelectedIndex(), options[item.getSelectedIndex()]);
        options[item.getSelectedIndex()].focus();

        // Remove tabindex from parent
        const parent = document.querySelector(`.fs-select[data-name="${item.getName()}"]`);
        setAtt(parent, 'tabindex', -1);
      }

      // Close other Fancy Selects.
      for (let i = 0; i < fsObjects.length; i += 1) {
        if (fsObjects[i].getName() !== item.getName()) {
          fsObjects[i].close();
        }
      }
    }
  }
}


// Get closest parent element by selector
// https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
const getClosest = (elem, selector) => {

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


/*********************************************************************
 * End utility functions
 *********************************************************************/


const debugLevel = 0;


/**
 * Parse native <select> elements into JavaScript objects. 
 * Use createFancySelects to transform these objects into Fancy Selects
 * @returns {Object} Reference to an array of FancySelect objects.
 */
const parseSelects = () => {
  // This used to be a global variable. Fall back to using it as a global if things don't start working.
  const fancySelects = []; // Contains all Fancy Select objects

  // Get native <select> elements
  const nativeSelects = document.getElementsByClassName('fs-select-origin');
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
    fancySelects.push(new FancySelect(item.name, item.options, item.texts, item.selectedIndex, item.isOpen));
  }

  // Log how many were successfully parsed
  if (debugLevel > 0) 
    console.log(`Found ${nativeSelects.length} <select> elements and converted ${fancySelects.length} into objects.`);
  
  return fancySelects;
}


/**
 * Create DOM elements from FancySelect objects.
 * @param {Array} items Array of FancySelect objects.
 * @returns {Array} Array of Fancy Select DOM elements.
 */
const createFancySelects = (items) => {
  const DOMElements = [];

  for(let i = 0; i < items.length; i += 1) {
    if (debugLevel > 1)
      console.log('Creating Fancy Select', items[i]);

    // CONTAINER
    const container = document.createElement('div');
    setAtt(container, 'class', 'fs-select'); // class
    setAtt(container, 'data-name', items[i].getName()) // data-name
    // Data-width
    setAtt(container, 'data-width', '7.5');
    // Make tab-navigable
    setAtt(container, 'tabindex', '0');
    
    // PLACEHOLDER
    const ph = document.createElement('span');
    setAtt(ph, 'class', 'fs-placeholder');
    
    // Set placeholder value to what is selected
    const phText = items[i].getTexts()[items[i].selectedIndex];
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
    for(let j = 0; j < items[i].getOptions().length; j += 1) {
      const opt = document.createElement('li');
      setAtt(opt, 'tabindex', -1); // Let scripts focus these options. Needed for keyboard navigation.
      setAtt(opt, 'data-value', items[i].getOptions()[j]);
      try {
        // Add text to option.
        optTextNode = document.createTextNode(items[i].getTexts()[j]);
        opt.appendChild(optTextNode);
      } catch (e) {
        console.warn(`Select element named ${items[i].getName()} has unequal amounts of options and texts. Check that each option has a value attribute and text content.`);
      }

      // Add created <li> element to <ul> wrapper.
      oList.appendChild(opt);
    }

    oWrapper.appendChild(oList); // Add <ul> to wrapper
    container.appendChild(oWrapper); // Add options list wrapper to container

    // Add created Fancy Selects into their correct positions and hide the native <select> element.
    const sourceLocations = document.getElementsByName(items[i].getName());
    for (let j = 0; j < sourceLocations.length; j += 1) {
      // Add Fancy Select
      sourceLocations[j].parentElement.appendChild(container);
      // Hide original <select>
      sourceLocations[j].style.display = 'none';
    }

    DOMElements.push(container);
  }

  return DOMElements;
}


/**
 * Handle what happens when the user selects a dropdown value.
 * @param {*} event Click event
 * @param {FancySelect} parent The Fancy Select object whose option was clicked.
 * @param {*} element The Fancy Select DOM element whose option was clicked.
 */
function handleSelect(event, parent, element) {
  // Get the newly clicked value.
  const value = event.target.attributes['data-value'].value;

  // Find the value in the Fancy Select object's options array.
  for (let i = 0; i < parent.getOptions().length; i += 1) {
    if (parent.getOptions()[i] === value) {
      // Select the new option with the matching index we found.
      parent.select(i);

      // Update the native <select> element's selected value.
      updateSelectElements({ name: parent.getName(), index: i });
    }
  }

  parent.close();

  // Update Fancy Select placeholders
  if (debugLevel > 1)
    console.log('Updating placeholder text for', element);
  updatePlaceholder(parent, element);

  return;
}


/**
 * Update <select> elements.
 * @param {Array} items Element names and selected indices that were updated.
 */
const updateSelectElements = (items) => {
  // Update native <select> elements.
  let nativeCollection = document.getElementsByTagName('select'); // Returns a HTMLCollection

  if (!(items instanceof Array)) {
    items = [items];
  }

  for (n of nativeCollection) {
    for (i of items) {
      // Only modify elements that have changed.
      if (n.name === i.name) {
        // Remove 'selected' attribute from old option
        const oldSelectedOption = ( n.querySelector('option[selected]') || n.querySelector('option[selected="selected"]') );
        oldSelectedOption.removeAttribute('selected');

        // Set new option as selected
        setAtt(n.getElementsByTagName('option')[i.index], 'selected', 'selected');
      }
    }
  }
}


/**
 * Update Fancy Select placeholder text with what the data object has selected.
 * @param {Object} obj Fancy Select object with new values.
 * @param {Object} element Fancy Select DOM element that needs to be updated.
 */
const updatePlaceholder = (obj, element) => {
  const placeholder = element.querySelector('.fs-placeholder');
  const newValue = obj.getText(obj.getSelectedIndex());

  // Update placeholder with newly found text
  if (placeholder.innerHTML !== newValue) {
    placeholder.innerHTML = newValue;
    count =+ 1;
  }

  // Update styling on the <li> element if it matches the current value
  var listElements = element.querySelectorAll('.fs-options .fs-options-list li');
  for (var j = 0; j < listElements.length; j += 1) {
    if (listElements[j].textContent === newValue) {
      listElements[j].style.color = '#777777';
    } else {
      listElements[j].removeAttribute('style');
    }
  }
}


/**
 * Initialize all Fancy Select DOM element sizes.
 * - Width is calculated from the data-width property set in each element
 * - Height is calculated from the number of options each element has
 * @param {Array} items Array of Fancy Select DOM elements.
 */
const initializeSelectSizes = (items) => {
  /* WIDTH */
  // Set Fancy Select element widths from their data-width properties
  // var fancySelects = document.getElementsByClassName('fs-select');
  const fancySelects = items;
  for (let i = 0; i < fancySelects.length; i += 1) {
    // Read target width from data-width attribute
    var targetWidth = fancySelects[i].attributes['data-width'].value;

    // Apply width as a style
    fancySelects[i].style.width = targetWidth + 'em';
  }

  /* HEIGHT */
  // Set how high each .fs-select::before element is based on how many options it contains
  // Start by dynamically creating an empty stylesheet at the document head
  const styleElem = document.head.appendChild(document.createElement('style'));

  // Then loop through all the Fancy Select elements.
  let processedCount = 0;
  for (let i = 0; i < fancySelects.length; i += 1) {
    const current = fancySelects[i];
    // Count number of <li> elements it has as children
    let liCount = current.querySelectorAll('.fs-options .fs-options-list li').length;
    
    // Give the current Fancy Select a unique ID
    let id = 'fs-unique-' + i;
    // To make sure the ID is unique, keep giving it a suffix number until no similar ids are found within the document
    let iteration = 0;
    while (document.getElementById(id) !== null) {
      id = 'fs-unique-' + i + '-' + iteration;
    }
    current.setAttribute('id', id);

    // Add an entry to our new stylesheet (in the page head) concerning the ::before element of our fancy-select
    const activeWidth = 1;
    const activeHeight = liCount / 1.25;
    const selector = '#' + id + '.fs-active::before';
    const style = '{ transform: scale(' + activeWidth +', ' + activeHeight + '); }'
    styleElem.innerHTML = styleElem.innerHTML + selector + style;

    processedCount += 1;
  }

  if (debugLevel > 0)
    console.log(`Initialized size of ${processedCount} Fancy Select elements.`)
}


/**
 * Find <select> elements and build Fancy Selects from them, hiding the native <select> elements.
 * @returns {Object} Array of Fancy Select Objects (fsObjects) and array of Fancy Select DOM elements (fsElements).
 */
const init = () => {
  // Parse native <select> elements into JS objects
  const items = parseSelects();

  // Construct a Fancy Select element from each object
  const elements = createFancySelects(items);

  if (debugLevel > 0)
    console.log('Created DOM elements from FancySelect objects', elements);

  return {
    fsObjects: items,
    fsElements: elements,
  };
}


window.docReady(function() {  
  // Initialize fancy-select
  const { fsObjects, fsElements } = init();

  // Initialize fancy-select element sizes
  initializeSelectSizes(fsElements);

  // Update placeholder texts to select element values
  for (let i = 0; i < fsObjects.length; i += 1) {
    updatePlaceholder(fsObjects[i], fsElements[i]);
  }

  // Add event listeners to <select> elements just in case the user manages to change them.
  var selectElements = document.getElementsByClassName('fs-select-origin');
  for (var i = 0; i < selectElements.length; i += 1) {
    selectElements[i].addEventListener('change', () => updatePlaceholder(fsObjects[i], fsElements[i]));
  }

  // Add event listeners to Fancy Select options.
  for (let i = 0; i < fsElements.length; i += 1) {
    const listElements = fsElements[i].querySelectorAll('.fs-options-list li');
    for (let j = 0; j < listElements.length; j += 1) {
      const child = listElements[j];
      const item = fsObjects[i];
      const element = fsElements[i];

      // Add click handlers
      child.addEventListener('click', event => handleSelect(event, fsObjects[i], fsElements[i]));
      child.addEventListener('blur', (event) => {
        // Find out where focus went
        const focusTarget = event.relatedTarget;

        // If an option of this Fancy Select was focused, do nothing. Otherwise set this Fancy Select's tabindex to 0.
        if (!element.contains(focusTarget)) {
          setAtt(element, 'tabindex', '0');
        }
      });

      // Add arrow key listeners
      child.addEventListener('keydown', (event) => {
        let indexToFocus = item.getSelectedIndex();
        switch (event.keyCode) {
          case 38: // Up
            indexToFocus = Math.max(j-1, 0);
            listElements[indexToFocus].focus();
            break;
          case 40: // Down
            indexToFocus = Math.min(j+1, listElements.length-1);
            listElements[indexToFocus].focus();
            break;
          default:
            break;
        }
      })
    }
  }

  // Toggle Fancy Select active state when it is clicked.
  if (fsElements && typeof fsElements !== 'undefined') {
    for (let i = 0; i < fsElements.length; i += 1) {
      // Add click and keydown event listeners
      const obj = fsObjects[i];
      const element = fsElements[i];

      element.addEventListener('click', event => handleClick(event, obj, fsObjects));
      element.addEventListener('focus', event => handleClick(event, obj, fsObjects));
    }
  } else {
    console.log('Didn\'t find any Fancy Selects to add click and keydown handlers to.');
  }

  // When the document body is clicked, close all Fancy Selects
  document.body.addEventListener('click', event => handleClick(event, null, fsObjects));

  // Make the "GO" button do something
  document.querySelector('.fs-go').addEventListener('click', event => {
    console.log(fsObjects.map(item => item.getText(item.getSelectedIndex())));
  });

});
