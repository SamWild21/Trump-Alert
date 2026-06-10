import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

export async function loadDotEnv(filePath = path.join(projectRoot, '.env')) {
  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export function getConfig(env = process.env) {
  const required = [
    'TRUTH_SOCIAL_SOURCE_URL',
    'GMAIL_USER',
    'GMAIL_APP_PASSWORD',
    'EMAIL_TO'
  ];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const pollIntervalSeconds = parsePositiveInteger(
    env.POLL_INTERVAL_SECONDS ?? '300',
    'POLL_INTERVAL_SECONDS'
  );
  if (pollIntervalSeconds < 30) {
    throw new Error('POLL_INTERVAL_SECONDS must be at least 30 seconds.');
  }

  const emailTo = splitRecipients(env.EMAIL_TO);
  if (emailTo.length === 0) {
    throw new Error('EMAIL_TO must contain at least one recipient address.');
  }

  return {
    truthSocialSourceUrl: env.TRUTH_SOCIAL_SOURCE_URL,
    truthSocialAuthToken: env.TRUTH_SOCIAL_AUTH_TOKEN,
    gmailUser: env.GMAIL_USER,
    gmailAppPassword: env.GMAIL_APP_PASSWORD,
    emailFrom: env.EMAIL_FROM || env.GMAIL_USER,
    emailTo,
    pollIntervalMs: pollIntervalSeconds * 1000,
    port: parsePositiveInteger(env.PORT ?? '3000', 'PORT'),
    stateFile: path.resolve(projectRoot, env.STATE_FILE ?? './data/state.json'),
    sendInitialAlerts: parseBoolean(env.SEND_INITIAL_ALERTS ?? 'false')
  };
}

function parsePositiveInteger(value, name) {
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return number;
}

function splitRecipients(value) {
  return value
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function parseBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}
