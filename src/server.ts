import { createServer, Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

interface ServerConfig {
  port: number;
}

class Server {
  private httpServer: HttpServer;
  private ioServer: IOServer;
  private port: number;

  constructor({ port }: ServerConfig) {
    this.port = port;
    this.httpServer = createServer();
    this.ioServer = new IOServer(this.httpServer, {
      //
    });
    this.setupIOServer();
  }

  private setupIOServer(): void {
    this.ioServer.on('connection', (socket: Socket) => {
      socket.emit('hello', 'world');
      // ToDo! Find if socket close required
    });
  }

  public start(): void {
    this.httpServer.listen(this.port);
  }

  public stop(): void {
    this.httpServer.close();
  }
}

export default Server;
