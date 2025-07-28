// ==UserScript==
// @name         GeoFS Autothrottle
// @namespace    https://github.com/meatbroc/geofs-autothrottle/
// @version      v1.6
// @description  Autothrottle addon for GeoFS that allows you to control the plane while autopilot controls the throttle.
// @author       meatbroc
// @match        https://*.geo-fs.com/geofs.php*
// @match        https://www.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function() {
    function main () {
        geofs.autothrottle = {
            on: !1,
            init: function () {
                geofs.autothrottle.initStyles();
                geofs.autothrottle.callbackID = geofs.api.addFrameCallback(geofs.autothrottle.tickWrapper);
                const controlButton = $("<div/>").addClass("ext-autothrottle-bar").html(`<div class="ext-autothrottle-control-pad ext-autothrottle-pad" id="autothrottle-button" tabindex="0" onclick="geofs.autothrottle.toggle()"><div class="control-pad-label transp-pad">A/THR</div>`);
                $(".geofs-autopilot-bar").append(controlButton);
                const speedElmnt = $("<div/>").html(`<a class="ext-autothrottle-numberDown numberDown ext-autothrottle-control">-</a><input class="ext-autothrottle-numberValue numberValue ext-autothrottle-course" min="0" smallstep="5" stepthreshold="100" step="10" data-method="setSpeed" maxlength="4" max="9999" value="0"><a class="ext-autothrottle-numberUp numberUp">+</a><span>KTS</span>`).addClass("ext-autothrottle-control");
                const modeElmnt = $("<div/>").addClass("geofs-autopilot-control").html(`<span class="ext-autothrottle-switch ext-autothrottle-mode"><a class="ext-autothrottle-switchLeft switchLeft green-pad" data-method="setArm" value="false" id="armOff">OFF</a><a class="ext-autothrottle-switchRight switchRight" data-method="setArm" value="true" id="armOn">ON</a></span>`);
                modeElmnt.append($("<span/>").text("LND MODE"));
                const controlElmnt = $("<div/>").addClass("ext-autothrottle-controls").hide().append(speedElmnt, modeElmnt).appendTo($(".ext-autothrottle-bar"));
                const $tooltip = $("<div/>").addClass("mdl-tooltip").attr("for", "autothrottle-button").text("Toggle autothrottle on/off");
                controlButton.append($tooltip);
                componentHandler.upgradeElement($tooltip[0]);
                $(document).on("autothrottleOn", function() {
                    geofs.autopilot.on && geofs.autopilot.turnOff();
                    clearTimeout(geofs.autothrottle.panelTimeout);
                    geofs.autopilot.setArm(!1); // defaults to landing mode off
                    $(".ext-autothrottle-controls").show();
                    $(".ext-autothrottle-pad").removeClass("red-pad").addClass("green-pad");
                    geofs.autothrottle.on = !0;
                    var a = Math.round(geofs.animation.values.kias);
                    geofs.autopilot.setSpeed(a);
                    $(".ext-autothrottle-numberValue").val(a);
                });
                $(document).on("autothrottleOff", function() {
                    $(".ext-autothrottle-pad").removeClass("green-pad").addClass("red-pad");
                    $(".ext-autothrottle-controls").hide();
                    geofs.autothrottle.panelTimeout = setTimeout(function() {
                        $(".ext-autothrottle-pad").removeClass("red-pad").removeClass("green-pad");
                    }, 3E3)
                    geofs.autothrottle.on = !1;
                });
                $(document).on("autopilotOn", function () {
                    geofs.autothrottle.on && $(document).trigger("autothrottleOff");
                });
                // joystick support
                const o = controls.axisSetters.throttle.process;
                controls.axisSetters.throttle.process = function (e, t) {
                    if (geofs.autothrottle.on) return;
                    o(e, t);
                };
            },
            initStyles: function () {
                const style = document.createElement("style");
                style.innerHTML = `
                   .ext-autothrottle-pad {
                       width: 60px;
                       margin: 0px 10px;
                   }
                   .ext-autothrottle-bar {
                       white-space: nowrap;
                       display: flex;
                       align-items: flex-start;
                       pointer-events: all;
                   }
                   .ext-autothrottle-control-pad {
                       border: 1px solid #888;
                       background-color: #000;
                       box-shadow: 0px 0px 5px #000;
                       border-radius: 15px;
                       cursor: pointer !important;
                   }
                   .ext-autothrottle-controls {
                       vertical-align: bottom;
                       display: none;
                       margin-right: 10px;
                   }
                   .ext-autothrottle-control {
                       position: relative;
                       text-align: center;
                       margin: 0px 5px;
                       color: white;
                       line-height: 25px;
                       display: inline-block;
                   }
                   .ext-autothrottle-airport-label {
                       position: relative !important;
                       left: 17.5px;
                   }
                   .ext-autothrottle-highlighted {
                       color: #66ff00 !important;
                       border-color: white !important;
                   }
                   .ext-autothrottle-highlighted2 {
                       color: #FF0000 !important;
                       border-color: white !important;
                   }
                   .ext-autothrottle-control span {
                       display: block;
                       text-align: center;
                       text-shadow: #000 1px 1px 3px;
                       font-size: 12px;
                       top: 0px;
                       position: relative;
                   }
                   .ext-autothrottle-bar .ext-autothrottle-switch .ext-autothrottle-switchRight {
                       top: 0px !important;
                       border-radius: 0px 15px 15px 0px;
                       left: 0px;
                   }
                   .ext-autothrottle-bar .ext-autothrottle-switch .ext-autothrottle-switchLeft {
                       top: 0px !important;
                       border-radius: 15px 0px 0px 15px;
                       border-right: 5px;
                       right: -3px;
                   }
                   .ext-autothrottle-bar .ext-autothrottle-switch a {
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
                   .ext-autothrottle-bar .ext-autothrottle-control {
                       position: relative;
                       text-align: center;
                       margin: 0px 5px;
                       color: white;
                       line-height: 25px;
                       display: inline-block;
                   }
                   .ext-autothrottle-bar .ext-autothrottle-course {
                       width: 50px !important;
                   }
                   .ext-autothrottle-bar .ext-autothrottle-airport {
                       width: 70px !important;
                   }
                   .ext-autothrottle-numberDown {
                       border-radius: 15px 0px 0px 15px;
                       line-height: 23px;
                       right: -5px;
                       position: relative !important;
                   }
                   .ext-autothrottle-numberUp {
                       border-radius: 0px 15px 15px 0px;
                       line-height: 26px;
                       left: -5px;
                       position: relative !important;
                   }
                   .ext-autothrottle-airportInput {
                       border-radius: 15px 0px 0px 15px !important;
                   }
                   .ext-autothrottle-control .ext-autothrottle-numberDown,.ext-autothrottle-control .ext-autothrottle-numberUp {
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
                   .ext-autothrottle-control .ext-autothrottle-numberValue {
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
                       width: 120px; /* overriden in ext-autothrottle-course */
                       text-align: right;
                   }
                `;
                document.head.appendChild(style);
            },
            toggle: function () {
                !geofs.autothrottle.error && (geofs.autothrottle.on ? $(document).trigger("autothrottleOff") : $(document).trigger("autothrottleOn"));
            },
            tick: function (a, b) {
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
            },
            tickWrapper: function (a) {
                if (geofs.autothrottle.on) {
                    if (geofs.aircraft.instance.groundContact && geofs.autothrottle.armed) {
                        controls.throttle = 0;
                        $(document).trigger("autothrottleOff");
                        return;
                    }
                    var b = a - geofs.utils.now();
                    var c = b / 1E3;
                    try {
                        geofs.autothrottle.tick(c, b);
                    } catch (err) {
                        geofs.autothrottle.handleError(err);
                    }
                }
            },
            handleError: function (a) {
                console.error(a);
                ui.notification.show('An error with autothrottle occured, autothrottle is now disabled. Check console for more details.');
                geofs.debug.log("meatbroc autothrottle error");
                geofs.api.removeFrameCallback(geofs.autothrottle.callbackID);
                $(document).trigger("autothrottleOff");
                geofs.autothrottle.error = !0;
            },
        };
        geofs.autothrottle.init();
        geofs.autopilot.setArm = function (a) {
            const b = JSON.parse(a);
            geofs.autothrottle.armed = b;
            $("#armOn").toggleClass("green-pad", b);
            $("#armOff").toggleClass("green-pad", !b);
        }
        ;
    }
    window.executeOnEventDone("geofsInitialized", main);
})();
