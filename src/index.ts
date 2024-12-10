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
    DATE_RANGE: core.getInput('DATE_RANGE', {required: false}) || 'last_30_days',
    PRINT_SUMMARY: core.getBooleanInput('PRINT_SUMMARY', {required: true}),
    USE_OLD_FORMAT: core.getBooleanInput('USE_OLD_FORMAT', {required: false}),
    MAX_LANGUAGES: Number(core.getInput('MAX_LANGUAGES', {required: false}) || 5),
  };
}

function generateTitle(range: string, updateDate: string) {
  let title = 'latest';
  if (range === 'last_7_days') title = 'weekly';
  else if (range === 'last_30_days') title = 'monthly';
  return `My ${title} stack [update ${updateDate}]`;
}

async function fetchStatistics(httpClient: HttpClient, wakatimeBaseURL: string, range: string, apiKey: string) {
  const response = await httpClient.getJson(
    `${wakatimeBaseURL}/users/current/stats/${range}`,
    {Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`}
  ).catch(error => core.setFailed('Action failed: ' + error.message));
  // @ts-ignore
  return response.result?.data;
}

// Add constant for allowed languages (case-insensitive)
const ALLOWED_LANGUAGES = ['python', 'go', 'typescript', 'javascript'];

function generateSummary(items: any[], maxItems: number) {
  // Filter and process languages
  const filteredItems = items.filter(item => 
    ALLOWED_LANGUAGES.includes(item.name.toLowerCase())
  );
  
  // Sort filtered items by total_seconds in descending order
  const sortedItems = [...filteredItems].sort((a, b) => b.total_seconds - a.total_seconds);
  
  // Take only the top N items
  const topItems = sortedItems.slice(0, maxItems);
  
  return topItems.map(item => {
    const {name, percent, total_seconds} = item;
    return formatLine(name, total_seconds, percent);
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
  MAX_LANGUAGES,
}) {
  const httpClient = new HttpClient('WakaTime-Gist/1.3 +https://github.com/marketplace/actions/wakatime-gist');
  const stats = await fetchStatistics(httpClient, WAKATIME_BASE_URL, DATE_RANGE, WAKA_API_KEY);
  if (!stats) {
    console.error('Action failed: empty response from wakatime.com');
    return;
  }

  const languages = generateSummary(stats.languages || [], MAX_LANGUAGES);

  const updateDate = new Date().toLocaleDateString('en-us', {day: 'numeric', year: 'numeric', month: 'short'});
  const title = generateTitle(DATE_RANGE, updateDate);

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
