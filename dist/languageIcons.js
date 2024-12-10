"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectIcon = exports.languageIcons = void 0;
exports.getLanguageIcon = getLanguageIcon;
exports.getProjectIcon = getProjectIcon;
var fs_1 = require("fs");
var path_1 = require("path");
function loadPngIcon(filename) {
    try {
        var path = (0, path_1.resolve)(__dirname, '../assets/png', filename);
        var pngContent = (0, fs_1.readFileSync)(path);
        // Convert PNG to base64 and wrap in markdown image syntax
        var base64 = pngContent.toString('base64');
        return "![](data:image/png;base64,".concat(base64, ")");
    }
    catch (error) {
        console.error("Failed to load icon: ".concat(filename), error);
        return '';
    }
}
exports.languageIcons = {
    Python: loadPngIcon('python.png'),
    Go: loadPngIcon('go.png'),
    TypeScript: loadPngIcon('ts.png'),
    JavaScript: loadPngIcon('js.png'),
};
exports.projectIcon = loadPngIcon('repo.png');
function getLanguageIcon(language) {
    return exports.languageIcons[language] || language;
}
function getProjectIcon() {
    return exports.projectIcon;
}
