define(function(require) {
  'use strict';

    /* Update the sim Security and Manager item 
       based on mozMobileConnections and Device.
     */

    var updateSimItem = function rph_refrehsSimItems() {
       if (navigator.mozMobileConnections) {
         if (navigator.mozMobileConnections.length === 1) { // single sim
           document.getElementById('simCardManager-settings').hidden = true;
         } else { // dsds
           document.getElementById('simSecurity-settings').hidden = true;
         }
       } else {
         // hide telephony panels
         var elements = ['simSecurity-settings'];
         elements.forEach(function(el) {
           document.getElementById(el).hidden = true;
         });
       }
     };
    updateSimItem();

});
