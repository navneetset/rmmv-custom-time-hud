/*:
 * @target MZ
 * @plugindesc CustomTimeHUD: A simple time HUD for RPG Maker MZ
 * @author navneetset
 * @url https://github.com/navneetset/rmmv-custom-time-hud
 *
 * @param HUD X Position
 * @type number
 * @min 0
 * @default 10
 * @desc The X position of the time HUD on the screen
 *
 * @param HUD Y Position
 * @type number
 * @min 0
 * @default 10
 * @desc The Y position of the time HUD on the screen
 *
 * @param HUD Font Size
 * @type number
 * @min 1
 * @default 20
 * @desc The font size of the time HUD
 *
 * @param HUD Font Color
 * @type string
 * @default #ffffff
 * @desc The font color of the time HUD
 *
 * @param HUD Font Face
 * @type string
 * @default GameFont
 * @desc The font face of the time HUD
 *
 * @param HUD background color
 * @type string
 * @default rgba(0, 0, 0, 0.5)
 * @desc The background color of the time HUD
 *
 * @param HUD background padding
 * @type number
 * @min 0
 * @default 5
 * @desc The padding of the time HUD
 *
 * @param Time Speed
 * @type number
 * @min 0.1
 * @default 60
 * @desc The number of frames per in-game minute. Default is 60 (1 second real-time = 1 minute in-game).
 *
 * @param Start Day
 * @type number
 * @min 1
 * @default 1
 * @desc The starting day of the game
 *
 * @param Start Month
 * @type number
 * @min 1
 * @default 1
 * @desc The starting month of the game
 *
 * @param Start Year
 * @type number
 * @min 1
 * @default 1
 * @desc The starting year of the game
 *
 * @command pauseTime
 * @text Pause Time
 * @desc Pauses the time system
 *
 * @command resumeTime
 * @text Resume Time
 * @desc Resumes the time system
 *
 * @help
 * This plugin creates a simple in-game time HUD for RPG Maker MZ.
 * Adjust the parameters to customize the appearance and speed of the time system.
 */

(() => {
  const parameters = PluginManager.parameters("CustomTimeHUD");
  const hudX = Number(parameters["HUD X Position"] || 10);
  const hudY = Number(parameters["HUD Y Position"] || 10);
  const hudFontSize = Number(parameters["HUD Font Size"] || 20);
  const hudFontColor = String(parameters["HUD Font Color"] || "#ffffff");
  const hudFontFace = String(parameters["HUD Font Face"] || "GameFont");
  const hudBackgroundColor = String(
    parameters["HUD background color"] || "rgba(0, 0, 0, 0.5)"
  );
  const hudBackgroundPadding = Number(
    parameters["HUD background padding"] || 5
  );
  const timeSpeed = Number(parameters["Time Speed"] || 60);
  const startDay = Number(parameters["Start Day"] || 1);
  const startMonth = Number(parameters["Start Month"] || 1);
  const startYear = Number(parameters["Start Year"] || 1);

  class TimeSystem {
    constructor() {
      if (!$gameSystem._time || isNaN($gameSystem._time)) {
        $gameSystem._time = 0;
      }

      if (!$gameSystem._day || isNaN($gameSystem._day)) {
        $gameSystem._day = startDay;
      }

      if (!$gameSystem._month || isNaN($gameSystem._month)) {
        $gameSystem._month = startMonth;
      }

      if (!$gameSystem._year || isNaN($gameSystem._year)) {
        $gameSystem._year = startYear;
      }

      this._paused = false;
    }

    update() {
      if (!this._paused) {
        $gameSystem._time += 1 / timeSpeed / 60;

        if ($gameSystem._time >= 24) {
          $gameSystem._time = 0;
          $gameSystem._day += 1;
        }

        if ($gameSystem._day > 30) {
          $gameSystem._day = 1;
          $gameSystem._month += 1;
        }

        if ($gameSystem._month > 12) {
          $gameSystem._month = 1;
          $gameSystem._year += 1;
        }
      }
    }

    pause() {
      this._paused = true;
    }

    resume() {
      this._paused = false;
    }

    hour() {
      return Math.floor($gameSystem._time) % 24;
    }

    minute() {
      return Math.floor($gameSystem._time * 60) % 60;
    }

    day() {
      return $gameSystem._day;
    }

    month() {
      return $gameSystem._month;
    }

    year() {
      return $gameSystem._year;
    }

    timeString() {
      return (
        `${this.hour().toString().padStart(2, "0")}` +
        ":" +
        `${this.minute().toString().padStart(2, "0")}`
      );
    }

    shouldUpdateHUD() {
      const prevInGameTime = ($gameSystem._time - 1 / timeSpeed / 60) * 60;
      const currentInGameTime = $gameSystem._time * 60;

      const prevMinute = Math.floor(prevInGameTime) % 60;
      const currentMinute = Math.floor(currentInGameTime) % 60;

      return Math.floor(prevMinute / 10) !== Math.floor(currentMinute / 10);
    }
  }

  class HtmlTimeHUD {
    constructor() {
      this.createHtmlElement();
    }

    createHtmlElement() {
      this._timeHudElement = document.createElement("div");
      this._timeHudElement.id = "time-hud";
      this._timeHudElement.style.position = "absolute";
      this._timeHudElement.style.left = `${hudX}px`;
      this._timeHudElement.style.top = `${hudY}px`;
      this._timeHudElement.style.backgroundColor = hudBackgroundColor;
      this._timeHudElement.style.padding = `${hudBackgroundPadding}px`;
      this._timeHudElement.style.borderRadius = "5px";
      this._timeHudElement.style.fontFamily = hudFontFace;
      this._timeHudElement.style.fontSize = `${hudFontSize}px`;
      this._timeHudElement.style.color = hudFontColor;
      this._timeHudElement.style.zIndex = 1000;
      document.body.appendChild(this._timeHudElement);
    }

    update() {
      const timeString = $gameTimeSystem.timeString();
      const day = $gameTimeSystem.day();
      const month = $gameTimeSystem.month();
      const year = $gameTimeSystem.year();

      if ($gameTimeSystem.shouldUpdateHUD()) {
        this._timeHudElement.innerHTML = `${timeString} | Day ${day} | Month ${month} | Year ${year}`;
      }

      this._timeHudElement.innerText = `${timeString} | Day ${day} | Month ${month} | Year ${year}`;
    }

    remove() {
      if (this._timeHudElement) {
        document.body.removeChild(this._timeHudElement);
      }
    }
  }

  Scene_Map.prototype.createTimeWindow = function () {
    this._timeHtmlHud = new HtmlTimeHUD();
  };

  const _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
  Scene_Map.prototype.updateMain = function () {
    _Scene_Map_updateMain.call(this);
    $gameTimeSystem.update();
    this._timeHtmlHud.update();
  };

  const _Scene_Map_terminate = Scene_Map.prototype.terminate;
  Scene_Map.prototype.terminate = function () {
    _Scene_Map_terminate.call(this);
    this._timeHtmlHud.remove();
  };

  const _Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function () {
    _Scene_Boot_start.call(this);
  };

  const _Scene_Map_createDisplayObjects =
    Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function () {
    _Scene_Map_createDisplayObjects.call(this);
    $gameTimeSystem = new TimeSystem();
    this.createTimeWindow();
  };

  PluginManager.registerCommand("CustomTimeHUD", "pauseTime", (args) => {
    $gameTimeSystem.pause();
  });

  PluginManager.registerCommand("CustomTimeHUD", "resumeTime", (args) => {
    $gameTimeSystem.resume();
  });
})();
