import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadPngIcon(filename: string): string {
  try {
    const path = resolve(__dirname, '../assets/png', filename);
    const pngContent = readFileSync(path);
    // Convert PNG to base64 and wrap in markdown image syntax
    const base64 = pngContent.toString('base64');
    return `![](data:image/png;base64,${base64})`;
  } catch (error) {
    console.error(`Failed to load icon: ${filename}`, error);
    return '';
  }
}

export const languageIcons: Record<string, string> = {
  Python: loadPngIcon('python.png'),
  Go: loadPngIcon('go.png'),
  TypeScript: loadPngIcon('ts.png'),
  JavaScript: loadPngIcon('js.png'),
};

export const projectIcon = loadPngIcon('repo.png');

export function getLanguageIcon(language: string): string {
  return languageIcons[language] || language;
}

export function getProjectIcon(): string {
  return projectIcon;
}
