/* global RootPanelHandler */
'use strict';

require('/shared/test/unit/load_body_html_helper.js');
require('/js/panels/network/panel.js');
require('/js/panels/root/privacy_items.js');

mocha.globals([
  'RootPanelHandler'
]);

Object.defineProperty(document, 'readyState', {
  value: 'loading',
  configurable: true
});
require('/js/startup.js');

suite('should show/hide nfc item correctly', function() {
  var realNfc;
  var nfcItem;

  setup(function() {
    realNfc = navigator.mozNfc;
    loadBodyHTML('./_root.html');
    nfcItem = document.querySelector('.nfc-settings');
  });

  teardown(function() {
    navigator.mozNfc = realNfc;
  });

  test('nfc is available', function() {
    navigator.mozNfc = {};
    updateSimItemsAndNfc();
    assert.isFalse(nfcItem.hidden);
  });

  test('nfc is not available', function() {
    navigator.mozNfc = null;
    updateSimItemsAndNfc();
    assert.isTrue(nfcItem.hidden);
  });
});

suite('should show/hide sim items correctly', function() {
  var realMozMobileConnections;

  var callSettingsItem;
  var dataConnectivityItem;
  var messagingItem;
  var simSecurityItem;

  setup(function() {
    realMozMobileConnections = navigator.mozMobileConnections;
    loadBodyHTML('./_root.html');
    callSettingsItem = document.getElementById('call-settings');
    dataConnectivityItem = document.getElementById('data-connectivity');
    messagingItem = document.getElementById('messaging-settings');
    simSecurityItem = document.getElementById('simSecurity-settings');
  });

  teardown(function() {
    navigator.mozMobileConnections = realMozMobileConnections;
  });

  test('no mobile connections', function() {
    navigator.mozMobileConnections = null;
    updateSimItemsAndNfc();
    updateSimItem();
    assert.isTrue(callSettingsItem.hidden);
    assert.isTrue(dataConnectivityItem.hidden);
    assert.isTrue(messagingItem.hidden);
    assert.isTrue(simSecurityItem.hidden);
  });

  test('single sim', function() {
    navigator.mozMobileConnections = {
      length: 1
    };
    updateSimItemsAndNfc();
    updateSimItem();
    assert.isFalse(callSettingsItem.hidden);
    assert.isFalse(dataConnectivityItem.hidden);
    assert.isFalse(messagingItem.hidden);
    assert.isFalse(simSecurityItem.hidden);
  });

  test('multiple sims', function() {
    navigator.mozMobileConnections = {
      length: 2
    };
    updateSimItemsAndNfc();
    updateSimItem();
    assert.isFalse(callSettingsItem.hidden);
    assert.isFalse(dataConnectivityItem.hidden);
    assert.isFalse(messagingItem.hidden);
    assert.isTrue(simSecurityItem.hidden);
  });
});


suite('RootPanelHandler', function() {
  var rootPanelHandler;
  var rootElement;

  setup(function() {
    loadBodyHTML('./_root.html');
    rootElement = document.getElementById('root');
  });

  teardown(function() {
    document.body.innerHTML = '';
  });

  suite('should show/hide developer menu item correctly', function() {
    var realMozSettings;
    var developerMenuItem;
    var fakeSettings;

    setup(function() {
      realMozSettings = navigator.mozSettings;
      navigator.mozSettings = {
        createLock: function() {
          return {
            get: function(name) {
              if (name === 'developer.menu.enabled') {
                return Promise.resolve(fakeSettings);
              } else {
                return Promise.reject();
              }
            }
          };
        }
      };
      developerMenuItem =
        document.querySelector('[data-show-name="developer.menu.enabled"]');
    });

    teardown(function() {
      navigator.mozSettings = realMozSettings;
    });

    test('developer menu is enabled', function(done) {
      fakeSettings = {
        'developer.menu.enabled': true
      };
      rootPanelHandler = RootPanelHandler(rootElement);
      rootPanelHandler._updateDeveloperMenuItem().then(function() {
        assert.isFalse(developerMenuItem.hidden);
      }, function() {
        // This function does not reject.
        assert.isTrue(false);
      }).then(done, done);
    });

    test('developer menu is disabled', function(done) {
      fakeSettings = {
        'developer.menu.enabled': false
      };
      rootPanelHandler = RootPanelHandler(rootElement);
      rootPanelHandler._updateDeveloperMenuItem().then(function() {
        assert.isTrue(developerMenuItem.hidden);
      }, function() {
        // This function does not reject.
        assert.isTrue(false);
      }).then(done, done);
    });
  });
});
