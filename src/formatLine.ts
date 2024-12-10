import { getLanguageIcon } from './languageIcons';

const CONSTANTS = {
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

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function generateBarChart(percent: number): string {
  const filledBars = Math.round((percent / 100) * CONSTANTS.PROGRESS_BAR_WIDTH);
  const emptyBars = CONSTANTS.PROGRESS_BAR_WIDTH - filledBars;
  
  return CONSTANTS.BAR.FULL.repeat(filledBars) + 
         CONSTANTS.BAR.EMPTY.repeat(emptyBars);
}

function padWithDots(text: string, targetLength: number): string {
  const dots = CONSTANTS.SYMBOLS.DOT.repeat(Math.max(0, targetLength - text.length));
  return `${text}${dots}`;
}

export default function formatLine(name: string, totalSeconds: number, percent: number) {
  const icon = getLanguageIcon(name);
  const formattedTime = formatTime(totalSeconds);
  const roundedPercent = Math.round(percent);
  const progressBar = generateBarChart(percent);
  
  const paddedName = padWithDots(icon, CONSTANTS.LENGTHS.NAME_PADDING);
  
  return `${paddedName} ${progressBar} ${roundedPercent}${CONSTANTS.SYMBOLS.PERCENT} ${CONSTANTS.ICONS.TIME} ${formattedTime}`;
}
