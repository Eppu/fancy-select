window.docReady(function() {
  // Toggle active class.
  function toggleActive() {
    this.classList.toggle('fs-active');
  }

  var className = 'fs-options';

  // Toggle '.fs-options' active state when it is clicked.
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


  // Update select element value
  function updateSelect() {
    // Get select element's name from parent
    var name = this.parentElement.attributes['data-name'].value;
    // Get selected item value
    var value = this.attributes['data-value'].value;

    // Update all select elements with matching names to the new value
    var selects = document.getElementsByName(name);
    for (var i = 0; i < selects.length; i++) {
      selects[i].querySelector('option[value="' + value + '"]').selected = true;
    }
  }

  // When a <li> element is clicked
  // Find all .fs-options-list elements
  var listElements = document.querySelectorAll('.fs-options-list li');
  for (var i = 0; i < listElements.length; i++) {
    // Add click and keydown handlers
    listElements[i].onclick = updateSelect;
    listElements[i].keydown = updateSelect;
  }
  
});