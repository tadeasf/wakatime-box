"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = formatLine;
var languageIcons_1 = require("./languageIcons");
var CONSTANTS = {
    ICONS: {
        TIME: '🕓',
    },
    SYMBOLS: {
        PERCENT: '%',
        SPACE: ' ',
        DOT: '.',
    },
    LENGTHS: {
        NAME_PADDING: 15,
    },
    BAR: {
        EMPTY: '░',
        FULL: '█',
    },
    PROGRESS_BAR_WIDTH: 10,
};
function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return "".concat(hours, "h ").concat(minutes, "m");
    }
    return "".concat(minutes, "m");
}
function generateBarChart(percent) {
    var filledBars = Math.round((percent / 100) * CONSTANTS.PROGRESS_BAR_WIDTH);
    var emptyBars = CONSTANTS.PROGRESS_BAR_WIDTH - filledBars;
    return CONSTANTS.BAR.FULL.repeat(filledBars) +
        CONSTANTS.BAR.EMPTY.repeat(emptyBars);
}
function padWithDots(text, targetLength) {
    var dots = CONSTANTS.SYMBOLS.DOT.repeat(Math.max(0, targetLength - text.length));
    return "".concat(text).concat(dots);
}
function formatLine(name, totalSeconds, percent, useOldFormat, isProject) {
    if (isProject === void 0) { isProject = false; }
    var icon = isProject ? (0, languageIcons_1.getProjectIcon)() : (0, languageIcons_1.getLanguageIcon)(name);
    var formattedTime = formatTime(totalSeconds);
    var roundedPercent = Math.round(percent);
    var progressBar = generateBarChart(percent);
    var displayName;
    if (isProject) {
        displayName = "".concat(icon, " ").concat(name); // Include project name after icon
    }
    else {
        displayName = icon; // For languages, just use the icon (which includes the name)
    }
    var paddedName = padWithDots(displayName, CONSTANTS.LENGTHS.NAME_PADDING);
    return "".concat(paddedName, " ").concat(progressBar, " ").concat(roundedPercent).concat(CONSTANTS.SYMBOLS.PERCENT, " ").concat(CONSTANTS.ICONS.TIME, " ").concat(formattedTime);
}
