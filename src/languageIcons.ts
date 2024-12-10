export const languageIcons: Record<string, string> = {
  Python: '🐍 Python',
  Go: '💨 Go',
  TypeScript: '💩 TypeScript', 
  JavaScript: '💩 JavaScript',
};

export function getLanguageIcon(language: string): string {
  return languageIcons[language] || language;
}