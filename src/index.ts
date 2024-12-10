import * as core from '@actions/core';
import {HttpClient} from '@actions/http-client';
import {Octokit} from '@octokit/rest';
import {config as loadEnvConfig} from 'dotenv';
import {resolve} from 'path';
import formatLine from './formatLine';

loadEnvConfig({path: resolve(__dirname, '../.env')});

const DEFAULT_WAKATIME_BASE_URL = 'https://wakatime.com/api/v1';

function loadConfiguration() {
  return {
    GH_TOKEN: core.getInput('GH_TOKEN', {required: true}),
    WAKATIME_BASE_URL: core.getInput('WAKATIME_BASE_URL', {required: false}) || DEFAULT_WAKATIME_BASE_URL,
    WAKA_API_KEY: core.getInput('WAKA_API_KEY', {required: true}),
    GIST_ID: core.getInput('GIST_ID', {required: true}),
    DATE_RANGE: core.getInput('DATE_RANGE', {required: false}) || 'last_7_days',
    PRINT_SUMMARY: core.getBooleanInput('PRINT_SUMMARY', {required: true}),
    USE_OLD_FORMAT: core.getBooleanInput('USE_OLD_FORMAT', {required: false}),
    MAX_LANGUAGES: Number(core.getInput('MAX_LANGUAGES', {required: false}) || 5),
    MAX_PROJECTS: Number(core.getInput('MAX_PROJECTS', {required: false}) || 5),
  };
}

function generateTitle(range: string) {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-us', {
      month: 'short',
      day: 'numeric'
    });
  };

  const endDate = new Date();
  const startDate = new Date();
  let title = '';

  switch (range) {
  case 'last_7_days':
    startDate.setDate(endDate.getDate() - 7);
    title = 'Weekly';
    break;
  case 'last_30_days':
    startDate.setDate(endDate.getDate() - 30);
    title = 'Monthly';
    break;
  case 'last_6_months':
    startDate.setMonth(endDate.getMonth() - 6);
    title = '6-Month';
    break;
  case 'last_year':
    startDate.setFullYear(endDate.getFullYear() - 1);
    title = 'Yearly';
    break;
  default:
    title = 'Latest';
  }

  return `${title} stats [${formatDate(startDate)} - ${formatDate(endDate)}]`;
}

async function fetchStatistics(httpClient: HttpClient, wakatimeBaseURL: string, range: string, apiKey: string) {
  const response = await httpClient.getJson(
    `${wakatimeBaseURL}/users/current/stats/${range}`,
    {Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`}
  ).catch(error => core.setFailed('Action failed: ' + error.message));
  // @ts-ignore
  return response.result?.data;
}

// Modified to handle case variations
const ALLOWED_LANGUAGES = new Set(['python', 'go', 'typescript', 'javascript', 'rust', 'docker', 'bash', 'sh']);

function generateSummary(items: any[], maxItems: number, useOldFormat: boolean) {
  // Filter and process languages with case-insensitive comparison
  const filteredItems = items.filter(item => 
    ALLOWED_LANGUAGES.has(item.name.toLowerCase())
  );
  
  // Add debug logging
  console.log('Available languages:', items.map(item => item.name));
  console.log('Filtered languages:', filteredItems.map(item => item.name));
  
  // Sort filtered items by total_seconds in descending order
  const sortedItems = [...filteredItems].sort((a, b) => b.total_seconds - a.total_seconds);
  
  // Take only the top N items
  const topItems = sortedItems.slice(0, maxItems);
  
  return topItems.map(item => {
    const {name, percent, total_seconds} = item;
    return formatLine(name, total_seconds, percent, useOldFormat);
  });
}

function createSummaryTable() {
  return [[{data: 'Action', header: true}, {data: 'Result', header: true}]];
}

async function processSummary({
  GH_TOKEN,
  WAKATIME_BASE_URL,
  WAKA_API_KEY,
  GIST_ID,
  DATE_RANGE,
  PRINT_SUMMARY,
  USE_OLD_FORMAT,
  MAX_LANGUAGES,
}) {
  const httpClient = new HttpClient('WakaTime-Gist/1.3 +https://github.com/marketplace/actions/wakatime-gist');
  const stats = await fetchStatistics(httpClient, WAKATIME_BASE_URL, DATE_RANGE, WAKA_API_KEY);
  if (!stats) {
    console.error('Action failed: empty response from wakatime.com');
    return;
  }

  const languages = generateSummary(stats.languages || [], MAX_LANGUAGES, USE_OLD_FORMAT);

  const title = generateTitle(DATE_RANGE);

  if (languages.length === 0) {
    console.log('No statistics for the last time period. Gist not updated');
    return;
  }

  const content = languages.join('\n');

  const octokit = new Octokit({auth: GH_TOKEN});
  const gist = await octokit.gists.get({gist_id: GIST_ID}).catch(error => {
    console.error('Action failed: Gist ' + error.message);
    return null;
  });
  if (!gist) return;
  const filename = Object.keys(gist.data.files || {})[0];
  if (!filename) {
    console.error('Action failed: Gist filename not found');
    return;
  }

  // Update gist
  await octokit.gists.update({
    gist_id: GIST_ID,
    files: {
      [filename]: {
        filename: title,
        content: content,
      },
    },
  }).catch(error => console.error('Action failed: Gist ' + error.message));

  // Only try to write summary if we're in a GitHub Actions environment
  if (process.env.GITHUB_ACTIONS) {
    const summaryTable: any[] = createSummaryTable();
    summaryTable.push(['Statistics received', '✔']);
    summaryTable.push(['Gist updated', '✔']);
    const summary = core.summary
      .addHeading('Results')
      .addTable(summaryTable)
      .addBreak()
      .addLink('WakaTime-Gist/2.0', 'https://github.com/marketplace/actions/wakatime-gist');
    if (PRINT_SUMMARY) {
      await summary.write();
    } else {
      console.log(summary.stringify());
    }
  } else {
    // Local environment output
    console.log('\nResults:');
    console.log('✔ Statistics received');
    console.log(' Gist updated');
    console.log('\nWakaTime-Gist/2.0');
  }
}

(async () => {
  const config = loadConfiguration();
  await processSummary(config);
})();
