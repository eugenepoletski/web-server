import Client from 'socket.io-client';
import { Server } from './server';

describe('Shopping list management', () => {
  describe('Shopping list items CRUD', () => {
    let server, clientSocket;

    beforeEach((done) => {
      const port = 3000;
      server = new Server({ port });
      server.start(() => {
        clientSocket = Client(`http://localhost:${port}`);
        done();
      });
    });

    afterEach((done) => {
      clientSocket.close();
      server.stop();
      done();
    });

    it('Create a shopping list item', (done) => {
      clientSocket.on('hello', (arg) => {
        expect(arg).toBe('world');
        done();
      });
    });
  });
});
