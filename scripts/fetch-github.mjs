#!/usr/bin/env node
/**
 * Pulls pinned repositories and the contribution calendar from GitHub's
 * GraphQL API at build time and writes data/github.json.
 *
 * Runs on every `npm run build` (via prebuild). Falls back to a stub if
 * no token is available so local builds and CI without secrets still pass.
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const USERNAME = 'alexmchughdev';
const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'data',
  'github.json',
);

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const query = `
  query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            forkCount
            primaryLanguage { name color }
            repositoryTopics(first: 6) { nodes { topic { name } } }
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

async function fetchFromGitHub() {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'alexmchugh.dev-build',
    },
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  const user = json.data.user;
  return {
    fetchedAt: new Date().toISOString(),
    pinned: user.pinnedItems.nodes.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount,
      forks: r.forkCount,
      language: r.primaryLanguage
        ? { name: r.primaryLanguage.name, color: r.primaryLanguage.color }
        : null,
      topics: r.repositoryTopics.nodes.map((t) => t.topic.name),
    })),
    calendar: {
      total: user.contributionsCollection.contributionCalendar.totalContributions,
      weeks: user.contributionsCollection.contributionCalendar.weeks.map((w) => ({
        days: w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          weekday: d.weekday,
        })),
      })),
    },
  };
}

function stub() {
  return {
    fetchedAt: null,
    stub: true,
    pinned: [],
    calendar: { total: 0, weeks: [] },
  };
}

async function main() {
  await mkdir(dirname(OUT), { recursive: true });

  if (!token) {
    if (existsSync(OUT)) {
      console.log('[fetch-github] no token; keeping existing data/github.json');
      return;
    }
    console.warn('[fetch-github] no GITHUB_TOKEN — writing stub data');
    await writeFile(OUT, JSON.stringify(stub(), null, 2));
    return;
  }

  try {
    const data = await fetchFromGitHub();
    await writeFile(OUT, JSON.stringify(data, null, 2));
    console.log(
      `[fetch-github] wrote ${data.pinned.length} pins, ${data.calendar.weeks.length} weeks, ${data.calendar.total} contributions`,
    );
  } catch (err) {
    console.error('[fetch-github] failed:', err.message);
    if (existsSync(OUT)) {
      console.warn('[fetch-github] keeping existing data/github.json');
      return;
    }
    await writeFile(OUT, JSON.stringify(stub(), null, 2));
  }
}

main();
