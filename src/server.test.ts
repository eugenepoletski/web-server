import Client from 'socket.io-client';
import { Server } from './server';

describe('my first server test', () => {
  test('should work', (done) => {
    const port = 3000;
    const server = new Server({ port: 3000 });
    server.start();
    const clientSocket = Client(`http://localhost:${port}`);

    clientSocket.on('hello', (arg) => {
      expect(arg).toBe('world');
      clientSocket.close();
      server.stop();
      done();
    });
  });
});
