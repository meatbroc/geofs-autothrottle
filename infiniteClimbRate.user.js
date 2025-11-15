// ==UserScript==
// @name         GeoFS Infinite Climbrate
// @version      1
// @description  Removes climbrate limit
// @author       meatbroc
// @match        https://*.geo-fs.com/geofs.php*
// ==/UserScript==


(function() {
    window.executeOnEventDone("geofsInitialized", function() {
      geofs.autopilot.defaults.maxClimbrate = Infinity;
      geofs.autopilot.definition.maxClimbrate = Infinity;
      $(".numberValue.geofs-autopilot-verticalSpeed").attr("max", "Infinity");
    });
})();
