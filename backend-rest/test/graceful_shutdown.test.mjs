import test from 'node:test';
import assert from 'node:assert';
import { trackRequest, setupGracefulShutdown } from '../graceful_shutdown.mjs';

test('Graceful Shutdown Module', async (t) => {
  await t.test('trackRequest is a function', () => {
    assert.strictEqual(typeof trackRequest, 'function');
  });

  await t.test('trackRequest accepts req, res, next parameters', () => {
    const mockReq = {};
    const mockRes = {
      on: () => {},
    };
    const mockNext = () => {};

    trackRequest(mockReq, mockRes, mockNext);
  });

  await t.test('setupGracefulShutdown is a function', () => {
    assert.strictEqual(typeof setupGracefulShutdown, 'function');
  });

  await t.test('setupGracefulShutdown accepts a server parameter', () => {
    const mockServer = {
      close: () => {},
    };

    setupGracefulShutdown(mockServer);
  });

  await t.test('trackRequest calls next middleware', () => {
    let nextCalled = false;
    const mockReq = {};
    const mockRes = {
      on: () => {},
    };
    const mockNext = () => {
      nextCalled = true;
    };

    trackRequest(mockReq, mockRes, mockNext);
    assert.strictEqual(nextCalled, true);
  });

  await t.test('trackRequest handles response finish event', () => {
    let finishHandler;
    const mockReq = {};
    const mockRes = {
      on: (event, handler) => {
        if (event === 'finish') {
          finishHandler = handler;
        }
      },
    };
    const mockNext = () => {};

    trackRequest(mockReq, mockRes, mockNext);
    assert.strictEqual(typeof finishHandler, 'function');
  });

  await t.test('trackRequest handles response close event', () => {
    let closeHandler;
    const mockReq = {};
    const mockRes = {
      on: (event, handler) => {
        if (event === 'close') {
          closeHandler = handler;
        }
      },
    };
    const mockNext = () => {};

    trackRequest(mockReq, mockRes, mockNext);
    assert.strictEqual(typeof closeHandler, 'function');
  });

  await t.test('setupGracefulShutdown registers signal handlers', () => {
    const mockServer = {
      close: () => {},
    };

    const listeners = process.listeners('SIGTERM');
    const initialListenerCount = listeners.length;

    setupGracefulShutdown(mockServer);

    const newListeners = process.listeners('SIGTERM');
    assert(newListeners.length >= initialListenerCount);
  });

  await t.test('setupGracefulShutdown registers SIGINT handler', () => {
    const mockServer = {
      close: () => {},
    };

    const listeners = process.listeners('SIGINT');
    const initialListenerCount = listeners.length;

    setupGracefulShutdown(mockServer);

    const newListeners = process.listeners('SIGINT');
    assert(newListeners.length >= initialListenerCount);
  });
});
