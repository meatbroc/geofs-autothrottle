// ==UserScript==
// @name         GeoFS Autothrottle
// @namespace    https://github.com/meatbroc/geofs-autothrottle/
// @version      v0.5
// @description  Autothrottle addon for GeoFS that allows you to control the plane while AP controls the throttle.
// @author       meatbroc
// @match        https://geo-fs.com/geofs.php?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// ==/UserScript==

(function() {
    'use strict';
    window.flight = window.flight || {};
    window.flight.autothrottle = {
        on: true,
        init: function () {
            flight.autothrottle.initStyles();
            flight.autothrottle.callbackID = geofs.api.addFrameCallback(flight.autothrottle.tickWrapper);
        },
        initStyles: function () {
            if ($('[class^="ext-autopilot"]').length > 0) return;
            const style = document.createElement("style");
            style.innerHTML = `
               .ext-autopilot-pad {
                   width: 90px;
                   margin: 0px 10px;
               }
               .ext-autopilot-bar {
                   white-space: nowrap;
                   display: flex;
                   align-items: flex-start;
                   pointer-events: all;
               }
               .ext-control-pad {
                   border: 1px solid #888;
                   background-color: #000;
                   box-shadow: 0px 0px 5px #000;
                   border-radius: 15px;
                   cursor: pointer !important;
               }
               .ext-autopilot-controls {
                   vertical-align: bottom;
                   display: none;
                   margin-right: 10px;
               }
               .ext-autopilot-control {
                   position: relative;
                   text-align: center;
                   margin: 0px 5px;
                   color: white;
                   line-height: 25px;
                   display: inline-block;
               }
               .ext-airport-label {
                   position: relative !important;
                   left: 17.5px;
               }
               .ext-highlighted {
                   color: #66ff00 !important;
                   border-color: white !important;
               }
               .ext-highlighted2 {
                   color: #FF0000 !important;
                   border-color: white !important;
               }
               .ext-autopilot-control span {
                   display: block;
                   text-align: center;
                   text-shadow: #000 1px 1px 3px;
                   font-size: 12px;
                   top: 2px;
                   position: relative;
               }
               .ext-autopilot-bar .ext-autopilot-switch .ext-switchRight {
                   border-radius: 0px 15px 15px 0px;
                   left: 0px;
               }
               .ext-autopilot-bar .ext-autopilot-switch .ext-switchLeft {
                   border-radius: 15px 0px 0px 15px;
                   border-right: 5px;
                   right: -3px;
               }
               .ext-autopilot-bar .ext-autopilot-switch a {
                   user-select: none;
                   -webkit-user-select: none;
                   position: relative;
                   display: inline-block;
                   width: 35px;
                   height: 17px;
                   line-height: 19px;
                   cursor: pointer;
                   color: white;
                   background: #000;
                   margin: 2px 0px;
                   display: inline-block;
                   border: 1px solid white;
                   box-shadow: 0px 0px 5px #000;
               }
               .ext-autopilot-bar .ext-autopilot-control {
                   position: relative;
                   text-align: center;
                   margin: 0px 5px;
                   color: white;
                   line-height: 25px;
                   display: inline-block;
               }
               .ext-autopilot-bar .ext-autopilot-course {
                   width: 35px !important;
               }
               .ext-autopilot-bar .ext-autopilot-airport {
                   width: 70px !important;
               }
               .ext-numberDown {
                   border-radius: 15px 0px 0px 15px;
                   line-height: 23px;
                   right: -5px;
                   position: relative !important;
               }
               .ext-numberUp {
                   border-radius: 0px 15px 15px 0px;
                   line-height: 26px;
                   left: -5px;
                   position: relative !important;
               }
               .ext-airportInput {
                   border-radius: 15px 0px 0px 15px !important;
               }
               .ext-autopilot-control .ext-numberDown,.ext-autopilot-control .ext-numberUp {
                   user-select: none;
                   -webkit-user-select: none;
                   vertical-align: top;
                   cursor: pointer;
                   text-align: center;
                   color: white;
                   background: #000;
                   margin: 0px;
                   width: 30px;
                   display: inline-block;
                   border: 1px solid white;
                   height: 25px;
                   box-shadow: 0px 0px 5px #000;
               }
               .ext-autopilot-control .ext-numberValue {
                   font-family: 'LCD-Bold', monospace;
                   font-size: 20px !important;
                   letter-spacing: 1px;
                   display: inline-block;
                   vertical-align: top;
                   padding: 0px 5px;
                   margin: 0px;
                   background: #000;
                   border: 1px solid;
                   border-radius: 0px;
                   height: 25px;
                   line-height: 26px;
                   box-shadow: 0px 0px 5px #000;
                   color: white;
                   width: 80px;
                   text-align: right;
               }
            `;
            document.head.appendChild(style);
        }
        tick: function (a, b) {
            try {
                var A = clamp(Math.floor(b / geofs.api.renderingSettings.physicsDeltaMs), 1, 10)
                  , B = a / A;
                var c = geofs.animation.values
                , d = geofs.autopilot
                , e = d.values.speed
                , f = c.kias;
                geofs.autopilot.speedMode == "mach" && (e = geofs.utils.machToKnots(d.values.speed),
                f = geofs.utils.machToKnots(c.mach));
                d.PIDs.throttle.set(e, 0, 1);
                controls.throttle = d.PIDs.throttle.compute(f, B);
                controls.throttle = clamp(controls.throttle, 0, 1);
                window.myValues = [a, b, A, B, c, d, e, f];
            } catch (err) {
                console.error(err);
                ui.notification.show('An error with autothrottle occured, autothrottle is now disabled. Check console for more details.');
                geofs.api.removeFrameCallback(flight.autothrottle.callbackID);
            }
        },
        tickWrapper: function (a) {
            if (flight.autothrottle.on) {
                var b = a - geofs.utils.now();
                var c = b / 1E3;
                flight.autothrottle.tick(c, b);
            }
        },
    };
    window.executeOnEventDone("geofsInitialized", window.flight.autothrottle.init);
})();
