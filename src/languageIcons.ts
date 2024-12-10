export const languageIcons: Record<string, string> = {
  python: '🐍 Python',
  go: '💨 Go',
  typescript: '💩 TypeScript', 
  javascript: '💩 JavaScript',
  docker: '🐳 Docker',
  bash: '🐚 Bash',
  sh: '🐚 Bash',
  rust: '🦀 Rust',
};

export const projectIcon = '📦';

export function getLanguageIcon(language: string): string {
  return languageIcons[language.toLowerCase()] || language;
}
export function getProjectIcon(): string {
  return projectIcon;
}
