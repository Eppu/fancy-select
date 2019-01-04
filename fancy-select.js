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
    console.log('Generic click');
    for (let i = 0; i < fsObjects.length; i += 1) {
      fsObjects[i].close();
    }
  } else {
    // User clicked on a Fancy Select. Open the clicked element!
    item.open();

    // Close other Fancy Selects.
    for (let i = 0; i < fsObjects.length; i += 1) {
      if (fsObjects[i].getName() !== item.getName()) {
        fsObjects[i].close();
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


const debugLevel = 1;


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
      console.log('Creating fancy select', items[i]);

    // CONTAINER
    const container = document.createElement('div');
    setAtt(container, 'class', 'fs-select'); // class
    setAtt(container, 'data-name', items[i].getName()) // data-name
    // Data-width
    setAtt(container, 'data-width', '7.5');


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
      // sourceLocations[j].style.display = 'none';
    }

    DOMElements.push(container);
  }

  return DOMElements;
}


/**
 * Update specified (or all) Fancy Select elements with values from fancySelects[].
 * @param {Array} names Element names that are to be updated. If empty, will update all.
 */
const updateFancySelects = (names) => {
  const elems = [];
  if (names instanceof Array) {
    console.log('[updateFancySelects] Parameter is an array', names);
    // Find all Fancy Select elements
  } else {
    console.log('[updateFancySelects] Parameter is not an array. Updating all!', names);
  }
}






  /**
   * Toggle active state of a Fancy Select.
   * Changes isOpened to true for given element, false for all others.
   */
  function toggleActive(event) {
    // Check what was clicked;
    if (this.isGeneric) {
      event.stopPropagation();
      console.log('General click');
      const name = '__none';
    } else {
      event.stopPropagation();
      var name = getClosest(event.target, '.fs-select').attributes['data-name'].value;
    }

    // Update objects
    for (let item of fancySelects) {
      if (name !== '__none' && item.name === name ) {
        item.isOpen = true;
        const element = document.querySelector(`.fs-select[data-name="${name}"]`);
        element.classList.add('fs-active');
      } else {
        item.isOpen = false;
        unselectedElement = document.querySelector(`.fs-select[data-name="${item.name}"]`);
        unselectedElement.classList.remove('fs-active');
      }
    }

    // this.classList.toggle('fs-active');
  }


  function handleSelect(item) {
    // Update underlying data objects
    const updatedItems = updateData(item);

    // Update visible objects based on data that was changed
    if (updatedItems != undefined && updatedItems.length > 0) {
      updateElements(updatedItems);
    } else {
      for (let i = 0; i < fancySelects.length; i += 1) {
        console.log('Closing FancySelect', fancySelects[i].getName());
        
        const item = fancySelects[i];
        if (item.getOpenState()) {
          item.close();
        }
      }
    }

    // Refactor updateElements to update the placeholders or something
    // updatePlaceholders();
  }


  /**
   * Update underlying JavaScript select objects to reflect the element that was clicked.
   * @param {HTMLElement} elem Element that was clicked
   * @returns {Array} Names of the objects that were updated
   */
  const updateData = elem => {
    // Get select element's name from parent
    console.log('Clicked target: ', elem);
    var name = getClosest(elem, '.fs-select').attributes['data-name'].value;
    // Get selected item value
    var value = elem.attributes['data-value'].value;

    const updatedItems = [];
    // Update underlying object with new selected index.
    console.log(fancySelects);
    for (let entry of fancySelects) {
      // First find the right object(s)
      if (entry.getName() === name) {
        // Find index of newly selected value
        const oldIndex = entry.getSelectedIndex();
        const newIndex = entry.getOptions().indexOf(value);
        if (newIndex !== -1 && !(oldIndex === newIndex)) {
          entry.select(newIndex);
          console.log(`Successfully updated selectedIndex from ${oldIndex} to ${newIndex}`);
          updatedItems.push({
            name: name,
            index: newIndex,
          });
        } else {
          console.log(`Didn't update ${oldIndex} to ${newIndex}`);
        }
      }
    }

    return updatedItems;

    // Update all select elements with matching names to the new value
    /*
    var selects = document.getElementsByName(name);
    for (var i = 0; i < selects.length; i += 1) {
      selects[i].querySelector('option[value="' + value + '"]').selected = true;
    }
    */
  }


  /**
   * Update <select> elements AND Fancy Select placeholders.
   * @param {Array} items Element names and selected indices that were updated.
   */
  const updateElements = (items) => {
    console.log('Updating elements...', items);
    // Update native <select> elements.
    let nativeCollection = document.getElementsByTagName('select'); // Returns a HTMLCollection
    let nativeSelects = [].slice.call(nativeCollection); // Make a regular boring array out of the collection

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

    // NOTE: Running updatePlaceholders here creates unnecessary work since it does DOM scraping.
    // This function (updateElements) knows which elements to update. Use that to our advantage here!
    // updatePlaceholders();


    // NOTE: Currently not implemented
    // Update actual FancySelect elements
    updateFancySelects(items.map(i => i.name));
  }


  /**
   * Update Fancy Select placeholder texts to reflect the currently selected option in their respective <select> elements.
   * @param {Array} items Array of Fancy Select DOM elements.
   */
  const updatePlaceholders = (items) => {

    let count = 0;
    for (var i = 0; i < items.length; i += 1) {
      const current = items[i];
      const placeholder = current.querySelector('.fs-placeholder');

      // Get data-name attribute value from .fs-select element
      var dataName = current.attributes['data-name'].value;

      // Use data-name to find the correct <select> element and its currently selected option's text
      var selectElement = document.getElementsByName(dataName)[0];
      var selectValue = selectElement.options[selectElement.selectedIndex].innerText;

      // Update placeholder with newly found text
      if (placeholder.innerHTML !== selectValue) {
        placeholder.innerHTML = selectValue;
        count =+ 1;
      }

      // Update styling on the <li> element if it matches the current value
      var listElements = current.querySelectorAll('.fs-options .fs-options-list li');
      for (var j = 0; j < listElements.length; j += 1) {
        if (listElements[j].textContent === selectValue) {
          listElements[j].style.color = '#777777';
        } else {
          listElements[j].removeAttribute('style');
        }
      }
    }

    if (debugLevel > 0)
      console.log(`Updated Fancy Select placeholder texts for ${count} elements.`)
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
  updatePlaceholders(fsElements);

  // Add event listeners to <select> elements just in case the user manages to change them.
  var selectElements = document.getElementsByClassName('fs-select-origin');
  for (var i = 0; i < selectElements.length; i += 1) {
    selectElements[i].onchange = () => updatePlaceholders(fsElements);
  }

  // When a <li> element is clicked
  // Find all .fs-options-list elements
  // var listElements = document.querySelectorAll('.fs-options-list li');
  // for (var i = 0; i < listElements.length; i += 1) {
  //   // Add click and keydown handlers
  //   listElements[i].onclick = handleSelect;
  //   listElements[i].keydown = handleSelect;
  // }

  for (let i = 0; i < fsElements.length; i += 1) {
    const listElements = fsElements[i].querySelectorAll('.fs-options-list li');
    for (let j = 0; j < listElements.length; j += 1) {
      // Add click and keydown handlers
      listElements[j].onclick = () => handleSelect(fsElements[i]);
      listElements[j].keydown = () => handleSelect(fsElements[i]);
    }
  }

  // Toggle Fancy Select active state when it is clicked.
  if (fsElements && typeof fsElements !== 'undefined') {
    for (let i = 0; i < fsElements.length; i += 1) {
      // Add click and keydown event listeners.
      // fs_elements[i].onclick = toggleActive.bind(fs_elements[i]);
      // fs_elements[i].keydown = toggleActive.bind(fs_elements[i]);
      const obj = fsObjects[i];
      const element = fsElements[i];

      element.onclick = (event) => handleClick(event, obj, fsObjects);
      element.keydown = (event) => handleClick(event, obj, fsObjects);
    }
  } else {
    console.log('Could not find any elements with class name ' + className);
  }

  // When the document body is clicked, close all Fancy Selects
  document.body.addEventListener('click', (event) => handleClick(event, null, fsObjects));
});