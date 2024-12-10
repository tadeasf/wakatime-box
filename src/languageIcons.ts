export const languageIcons: Record<string, string> = {
  Python: '🐍 Python',
  Go: '💨 Go',
  TypeScript: '💩 TypeScript', 
  JavaScript: '💩 JavaScript',
};

export const projectIcon = '📦';

export function getLanguageIcon(language: string): string {
  return languageIcons[language] || language;
}
export function getProjectIcon(): string {
  return projectIcon;
}
