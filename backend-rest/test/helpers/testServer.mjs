// Spins up the real Express app on an OS-assigned port so tests can drive it
// with real HTTP requests (native fetch) instead of hand-simulating what a
// route "should" do.

export const startTestServer = (app) =>
  new Promise((resolve, reject) => {
    const server = app.listen(0);
    server.once('error', reject);
    server.once('listening', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://localhost:${port}` });
    });
  });

export const stopTestServer = (server) => new Promise((resolve) => server.close(resolve));
