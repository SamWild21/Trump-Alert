import { getConfig, loadDotEnv } from './config.js';
import { TruthSocialMonitor } from './monitor.js';
import { startHealthServer } from './server.js';
import { StateStore } from './stateStore.js';

await loadDotEnv();

const config = getConfig();
const stateStore = new StateStore(config.stateFile);
const monitor = new TruthSocialMonitor({ config, stateStore });
const server = startHealthServer({ port: config.port, stateStore });

monitor.start();

function shutdown(signal) {
  console.info(`Received ${signal}; shutting down.`);
  monitor.stop();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
