"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageIcons = void 0;
exports.getLanguageIcon = getLanguageIcon;
exports.languageIcons = {
    Python: '🐍 Python',
    Go: '💨 Go',
    TypeScript: '💩 TypeScript',
    JavaScript: '💩 JavaScript',
};
function getLanguageIcon(language) {
    return exports.languageIcons[language] || language;
}
