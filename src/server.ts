import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

let httpServer;

interface StartOptions {
  port: number;
}

export const start = ({ port }: StartOptions): void => {
  httpServer = createServer();
  const io = new Server(httpServer, {
    // ...
  });

  io.on('connection', (socket: Socket) => {
    socket.emit('hello', 'world');
    // ToDo! Learn if socket close required
  });

  httpServer.listen(port);
};

export const stop = (): void => {
  httpServer.close();
};
