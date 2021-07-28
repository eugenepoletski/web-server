import Client from 'socket.io-client';
import { start, stop } from './server';

describe('my first server test', () => {
  test('should work', (done) => {
    const port = 3000;
    start({ port: 3000 });
    const clientSocket = Client(`http://localhost:${port}`);

    clientSocket.on('hello', (arg) => {
      expect(arg).toBe('world');
      clientSocket.close();
      stop();
      done();
    });
  });
});
