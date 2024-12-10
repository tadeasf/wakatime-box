import { getLanguageIcon, getProjectIcon } from './languageIcons';

const CONSTANTS = {
  ICONS: {
    TIME: '🕓',
  },
  NAME_LENGTHS: {
    OLD: 12,
    NEW: 15,
    PROJECT: 20,
  },
  PADDING_LENGTHS: {
    NEW_1: 8,
    NEW_2: 28,
  },
  SYMBOLS: {
    PERCENT: '%',
    DOT: '.',
    ELLIPSIS: '...',
    BAR: '░▏▎▍▌▋▊▉█',
  },
  BAR_CHART_SIZE: 23,
  FRACTION_UNIT: 8,
};

function truncateString(str: string, len: number): string {
  const {ELLIPSIS} = CONSTANTS.SYMBOLS;
  return str.length > len ? str.substring(0, len - ELLIPSIS.length) + ELLIPSIS : str;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function generateBarChart(percent: number): string {
  const {BAR_CHART_SIZE, FRACTION_UNIT, SYMBOLS: {BAR}} = CONSTANTS;
  const frac = Math.floor((BAR_CHART_SIZE * FRACTION_UNIT * percent) / 100);
  const barsFull = Math.floor(frac / FRACTION_UNIT);
  const semiBarIndex = frac % FRACTION_UNIT;
  return barsFull >= BAR_CHART_SIZE
    ? BAR[8].repeat(BAR_CHART_SIZE)
    : BAR[8].repeat(barsFull) + BAR[semiBarIndex].padEnd(BAR_CHART_SIZE, BAR[0]);
}

export default function formatLine(name: string, totalSeconds: number, percent: number, useOldFormat: boolean, isProject: boolean = false) {
  const formattedSeconds = formatTime(totalSeconds);
  const formattedPercent = percent.toFixed(1);
  
  if (isProject) {
    // Handle project with repo icon
    const displayName = truncateString(name, CONSTANTS.NAME_LENGTHS.PROJECT);
    const dots = CONSTANTS.SYMBOLS.DOT.repeat(Math.max(0, CONSTANTS.NAME_LENGTHS.PROJECT - displayName.length));
    return `${getProjectIcon()} ${displayName}${dots} ${formattedSeconds} ${generateBarChart(percent)} ${formattedPercent}${CONSTANTS.SYMBOLS.PERCENT}`;
  }
  
  // Handle language with icon
  const icon = getLanguageIcon(name);
  const displayName = icon ? icon : truncateString(name, CONSTANTS.NAME_LENGTHS.OLD);
  const dots = CONSTANTS.SYMBOLS.DOT.repeat(Math.max(0, CONSTANTS.NAME_LENGTHS.OLD - displayName.length));
  
  return `${displayName}${dots} ${formattedSeconds} ${generateBarChart(percent)} ${formattedPercent}${CONSTANTS.SYMBOLS.PERCENT}`;
}
