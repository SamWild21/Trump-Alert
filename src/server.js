import http from 'node:http';

export function startHealthServer({ port, stateStore, logger = console }) {
  const server = http.createServer(async (request, response) => {
    if (request.url === '/healthz') {
      const state = await stateStore.read().catch(() => ({ lastPostId: null }));
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(
        JSON.stringify({
          ok: true,
          lastPostId: state.lastPostId,
          time: new Date().toISOString()
        })
      );
      return;
    }

    response.writeHead(200, { 'content-type': 'text/plain' });
    response.end('Truth Social email monitor is running. Health check: /healthz\n');
  });

  server.listen(port, '0.0.0.0', () => {
    logger.info(`Health server listening on port ${port}.`);
  });

  return server;
}
