(function () {

  'use strict';

  // Keys which are mapped to accesskey
  const KEYS_MAPPING = {
    LSK: 'F1',
    CSK: 'Enter',
    RSK: 'F2'
  };

  // Storing the reference to keys
  // which will show options menu
  var elements = {
    LSK: null,
    CSK: null,
    RSK: null
  };

  // Container created for SoftKey
  var container = null;

  // Check if menu open
  var skOptionsMenu = {
    open: false,
    cancelKey: KEYS_MAPPING.RSK
  };

  // Observer for observing the DOM changes
  var observer = null;

  //////////////////////////////

  // Initializing the module. Will be called once only.
  document.addEventListener(
          'DOMContentLoaded',
          init);

  //////////////////////////////

  /**
   * Used to initialize the library
   * @example
   * init();
   *
   * @param N/A
   * @return void 0
   */
  function init() {

    console.log('Init called for library');
    // Container will be created to handle
    // soft keys
    // A #IFDEF check is required for
    // NON-TOUCH UI
    createSoftKeyContainer();
    
    var optionsMenu = document.getElementById('sample-menu');
    if(optionsMenu){
      document.getElementById('sample-menu').style.display = 'none';
    }else{
      console.log('No option menu specified by page');
    }
    
    
    for (var k in elements) {
      if (elements.hasOwnProperty(k)) {

        // Selecting the button using accesskey
        // Intially only 1 view will be visible
        // with a particular accesskey
        elements[k] = document
                .querySelector('[accesskey="' + KEYS_MAPPING[k] + '"]');

        // Check if element found and visible
        if (elements[k] && elements[k].offsetHeight) {

          // Softkeys will be created for NON-Touch UI
          // A #IFDEF check is required for
          // NON-TOUCH UI
          createSoftKeyButton(elements[k], k);

          // Adding Event Listener for
          // displaying options menu
          // A #IFDEF check is required for
          // TOUCH UI
          var contextMenu = elements[k].getAttribute('contextmenu');
          if (contextMenu) {
            // Adding event listener for creating options menu
            elements[k].addEventListener('click',contextMenuClickHandler);
          }
        }
      }
    }

    // Adding Event Listener for keyup
    // A #IFDEF check is required for
    // NON-TOUCH UI
    window.addEventListener('keyup', handleSoftKey);

    // Start observing DOM change
    observeDOMChange(document);
  }
  
  /**
   * Used to handle click event for contextmenu.
   *
   * @param {object}
   *        key: Key which will be pressed
   *
   * @return void 0
   */
  function contextMenuClickHandler(key){
    handleOptionsMenu.call(key);
  }

  /**
   * Used to create soft key container
   * @example
   * createSoftKeyContainer();
   *
   * @param N/A
   * @return void 0
   */
  function createSoftKeyContainer() {
    // Parent container
    container = document.createElement('div');
    container.dataset.subtype = 'softkey-container';
    container.tabIndex = -1;

    container.classList.add('sk-container');

    document.body.appendChild(container);
  }

  /**
   * Used to create soft key buttons
   * @example
   * createSoftKeyButton(element, 'LSK');
   *
   * @param {object, string}
   *        key: Key which will be pressed
   *        keyType: Key type ie. LSK, RSK, CSK. 
   *                 Required for adding styles
   * @return void 0
   */
  function createSoftKeyButton(key, keyType) {
    var button = document.createElement('div');
    button.textContent = key.textContent;
    button.classList.add('sk-buttons', keyType);
    container.appendChild(button);

    // Hide the buttons for Non-Touch UI
    // Hiding visible buttons
    key.classList.add('sk-hide-button');
  }

  /**
   * Used to handle button press
   * @example
   * handleSoftKey(event);
   *
   * @param {event}
   *        e: Event object
   * @return void 0
   */
  function handleSoftKey(e) {
    for (var k in elements) {
      if (elements.hasOwnProperty(k)) {
        // If menu not open
        if (!skOptionsMenu.open) {
          if (elements[k] && e.key === elements[k].accessKey) {
            e.preventDefault();
            
            //TODO dirty patch need to remove
            if(e.key === 'F2' && !elements[k].onclick){
              elements[k].addEventListener('click', contextMenuClickHandler);
            }
            // Raise event on element
            elements[k].click();
            break;
          }
        }else {
          // Binded to LSK
          if (e.code ===
                  skOptionsMenu.cancelKey) {
            e.preventDefault();
            // Close the menu
            hideOptionsMenu();
            break;
          }
        }
      }
    }
  }
  
  

  /**
   * Used to handle button press
   * @example
   * handleOptionsMenu();
   *
   * @param N/A
   * @return void 0
   */
  function handleOptionsMenu() {
    document.getElementById('sample-menu').style.display = 'block';
    skOptionsMenu.open = true;

    if (container) {
      // Remove the container
      container.parentElement.removeChild(container);
      //container = null;
    }
    var cancelButton = document.getElementById('cancel');
    if(cancelButton){
        cancelButton.setAttribute('accesskey','F2');
        // Listener will be removed once we clean up the DOM
        cancelButton.addEventListener('click', function (event) {
        hideOptionsMenu();
      }); 
    }
  }

  /**
   * Used for hiding options menu
   * @example
   * hideOptionsMenu();
   *
   * @param N/A
   * @return void 0
   */
  function hideOptionsMenu() {
    document.getElementById('sample-menu').style.display = 'none';
    skOptionsMenu.open = false;
    document.body.appendChild(container);
  }

  /**
   * Used to observe DOM changes
   * @example
   * observeDOMChange(element);
   *
   * @param {object} target: Target element on which observer will observe
   * @return void 0
   */
  function observeDOMChange(target) {
    observer = new MutationObserver(function (mutations) {
      // Handling each change
      mutations.forEach(function (mutation) {
        for (var k in elements) {
          if (elements.hasOwnProperty(k)) {

            if (mutation.type === 'childList') {
              // Detect if TextContent Changes
              if (elements[k] === mutation.target) {
                container.querySelector('.' + k).textContent =
                        mutation.target.textContent;

                // No need to check if element is removed or added
                break;
              }

              // Detect if element with accesskey
              // attribute is removed
              if (mutation.removedNodes &&
                      mutation.removedNodes.length) {
                for (var i = 0; i < mutation.removedNodes.length; i++) {
                  // Detect if accesskey is there
                  if (elements[k] === mutation.removedNodes[i]) {
                    container.querySelector('.' + k).remove();
                    elements[k] = null;
                  }
                }
              }

              // TODO: Detect if element with accesskey
              // attribute is added
            }
            // Detect if accesskey changed
            // on current element
            else if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'accesskey') {

              // Check if key matched
              if (mutation.target.accessKey === KEYS_MAPPING[k]) {
                // Or may be copy the accesskey attribute
                elements[k] = mutation.target;
              }
            }
          }
        }
      });
    });

    observer.observe(target, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }

})();