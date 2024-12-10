"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectIcon = exports.languageIcons = void 0;
exports.getLanguageIcon = getLanguageIcon;
exports.getProjectIcon = getProjectIcon;
exports.languageIcons = {
    python: '🐍 Python',
    go: '💨 Go',
    typescript: '💩 TypeScript',
    javascript: '💩 JavaScript',
    docker: '🐳 Docker',
    bash: '🐚 Bash',
    sh: '🐚 Bash',
    rust: '🦀 Rust',
};
exports.projectIcon = '📦';
function getLanguageIcon(language) {
    return exports.languageIcons[language.toLowerCase()] || language;
}
function getProjectIcon() {
    return exports.projectIcon;
}
