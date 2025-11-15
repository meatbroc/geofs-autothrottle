// ==UserScript==
// @name         GeoFS Infinite Climbrate
// @namespace    https://github.com/meatbroc
// @version      1
// @description  Removes climbrate limit
// @author       meatbroc
// @match        https://*.geo-fs.com/geofs.php?v=*
// @grant        none
// ==/UserScript==

(function () {
    window.executeOnEventDone("geofsInitialized", function () {
        geofs.autopilot.defaults.maxClimbrate = Infinity;
        $(".numberValue.geofs-autopilot-verticalSpeed").attr("max", "Infinity");
    });
})();
