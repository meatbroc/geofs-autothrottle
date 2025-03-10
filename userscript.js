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
        on: false,
        init: function () {
            flight.autothrottle.initStyles();
            flight.autothrottle.callbackID = geofs.api.addFrameCallback(flight.autothrottle.tickWrapper);
            const controlButton = document.createElement("div");
            controlButton.classList.add("ext-autopilot-bar");
            controlButton.innerHTML = `<div class="ext-control-pad ext-autopilot-pad" id="atc-button" tabindex="0" onclick="flight.autothrottle.toggle()"><div class="control-pad-label transp-pad">A/THR</div>`;
            const container = document.getElementsByClassName("geofs-autopilot-bar");
            container[0].appendChild(controlButton);
            const controlElmnt = document.createElement("div");
            controlElmnt.classList.add("ext-autopilot-controls");
            controlElmnt.style.display = "none";
            controlElmnt.innerHTML = `<div class="ext-autopilot-control"><span class="ext-autopilot-switch ext-autopilot-mode"><a class="ext-switchLeft" data-method="setMode" value="HDG" id="radar-sel">RDR</a><a class="ext-switchRight" data-method="setMode" value="NAV" id="vis-sel">VIS</a></span></div>`;
            const radiusElmnt = document.createElement("div");
            radiusElmnt.classList.add("ext-autopilot-control");
            radiusElmnt.style.display = "none";
            radiusElmnt.innerHTML = `<a class="ext-numberDown" id="radius-selDown">-</a><input class="ext-numberValue ext-autopilot-course" min="0" max="359" data-loop="true" step="1" maxlength="3" value="1"><a class="ext-numberUp" id="radius-selUp">+</a><span>RDR RADIUS</span>`;
            const airportElmnt = document.createElement("div");
            airportElmnt.classList.add("ext-autopilot-control");
            airportElmnt.style.display = "none";
            airportElmnt.style.width = "64px";
            airportElmnt.innerHTML = `<input class="ext-airportInput ext-numberValue ext-autopilot-airport geofs-stopKeyboardPropagation geofs-stopKeyupPropagation" id="airport-selInput" min="0" max="359" data-loop="true" step="1" maxlength="4" value=""><a class="ext-numberUp" id="airport-selSub">→</a><span class="ext-airport-label">AIRPORT</span>`;
            const container2 = document.getElementsByClassName("ext-autopilot-bar");
            container2[0].appendChild(controlElmnt);
            container2[0].appendChild(radiusElmnt);
            container2[0].appendChild(airportElmnt);
            $(document).on("autothrottleOn", function() {
                clearTimeout(flight.autothrottle.panelTimeout);
                $(".ext-autopilot-controls").show();
                $(".ext-autopilot-pad").removeClass("red-pad").addClass("green-pad");
                flight.autothrottle.on = !0;
            });
            $(document).on("autothrottleOff", function() {
                $(".ext-autopilot-pad").removeClass("green-pad").addClass("red-pad");
                $(".ext-autopilot-controls").hide();
                flight.autothrottle.panelTimeout = setTimeout(function() {
                    $(".ext-autopilot-pad").removeClass("red-pad").removeClass("green-pad");
                }, 3E3)
                flight.autothrottle.on = !1;
            });
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
        },
        toggle: function () {
            flight.autothrottle.on ? $(document).trigger("autothrottleOff") : $(document).trigger("autothrottleOn");
        },
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
                geofs.debug.autothrottleValues = [a, b, A, B, c, d, e, f];
            } catch (err) {
                console.error(err);
                ui.notification.show('An error with autothrottle occured, autothrottle is now disabled. Check console for more details.');
                geofs.debug.log("meatbroc autothrottle error");
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
