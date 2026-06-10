import { getConfig, loadDotEnv } from './config.js';
import { sendTestEmail } from './email.js';

await loadDotEnv();

const config = getConfig();
const result = await sendTestEmail(config);

console.info(`Test email sent: ${result.messageId}`);
