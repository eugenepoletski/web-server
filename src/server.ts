import { createServer, Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

interface ServerConfig {
  port: number;
}

class Server {
  private httpServer: HttpServer;
  private port: number;

  constructor({ port }: ServerConfig) {
    this.port = port;
  }

  public start(): void {
    this.httpServer = createServer();
    const io = new IOServer(this.httpServer, {
      //
    });

    io.on('connection', (socket: Socket) => {
      socket.emit('hello', 'world');
      // ToDo! Find if socket close required
    });

    this.httpServer.listen(this.port);
  }

  public stop(): void {
    this.httpServer.close();
  }
}

export default Server;
