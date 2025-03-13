// ==UserScript==
// @name         GeoFS Autothrottle
// @namespace    https://github.com/meatbroc/geofs-autothrottle/
// @version      v1.0
// @description  Autothrottle addon for GeoFS that allows you to control the plane while autopilot controls the throttle.
// @author       meatbroc
// @match        https://*.geo-fs.com/geofs.php?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// ==/UserScript==

(function() {
    'use strict';
    window.geofs = window.geofs || {};
    window.geofs.autothrottle = {
        on: false,
        init: function () {
            geofs.autothrottle.initStyles();
            geofs.autothrottle.callbackID = geofs.api.addFrameCallback(geofs.autothrottle.tickWrapper);
            const controlButton = $("<div/>").addClass("ext-autopilot-bar").html(`<div class="ext-control-pad ext-autopilot-pad" id="atc-button" tabindex="0" onclick="geofs.autothrottle.toggle()"><div class="control-pad-label transp-pad">A/THR</div>`);
            $(".geofs-autopilot-bar").append(controlButton);
            const radiusElmnt = $("<div/>").html(`<a class="ext-numberDown numberDown ext-autopilot-control" id="radius-selDown">-</a><input class="ext-numberValue numberValue ext-autopilot-course" min="0" smallstep="5" stepthreshold="100" step="10" data-method="setSpeed" maxlength="4" value="0"><a class="ext-numberUp numberUp" id="radius-selUp">+</a><span>KTS</span>`).addClass("ext-autopilot-control");
            const controlElmnt = $("<div/>").addClass("ext-autopilot-controls").hide().append(radiusElmnt);
            $(".ext-autopilot-bar").append(controlElmnt);
            $(document).on("autothrottleOn", function() {
                geofs.autopilot.on && geofs.autopilot.turnOff();
                clearTimeout(geofs.autothrottle.panelTimeout);
                $(".ext-autopilot-controls").show();
                $(".ext-autopilot-pad").removeClass("red-pad").addClass("green-pad");
                geofs.autothrottle.on = !0;
            });
            $(document).on("autothrottleOff", function() {
                $(".ext-autopilot-pad").removeClass("green-pad").addClass("red-pad");
                $(".ext-autopilot-controls").hide();
                geofs.autothrottle.panelTimeout = setTimeout(function() {
                    $(".ext-autopilot-pad").removeClass("red-pad").removeClass("green-pad");
                }, 3E3)
                geofs.autothrottle.on = !1;
            });
            $(document).on("autopilotOn", function () {
                geofs.autothrottle.on && $(document).trigger("autothrottleOff");
            });
        },
        initStyles: function () {
            if ($('[class^="ext-autopilot"]').length > 0) return;
            const style = document.createElement("style");
            style.innerHTML = `
               .ext-autopilot-pad {
                   width: 60px;
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
            geofs.autothrottle.on ? $(document).trigger("autothrottleOff") : $(document).trigger("autothrottleOn");
        },
        speedUp: function (a) {
            console.log(a);
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
                geofs.api.removeFrameCallback(geofs.autothrottle.callbackID);
            }
        },
        tickWrapper: function (a) {
            if (geofs.autothrottle.on) {
                var b = a - geofs.utils.now();
                var c = b / 1E3;
                geofs.autothrottle.tick(c, b);
            }
        },
    };
    window.executeOnEventDone("geofsInitialized", window.geofs.autothrottle.init);
})();
