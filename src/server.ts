import { createServer, Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

interface ServerConfig {
  port: number;
  shoppingListService: any;
}

export class Server {
  private httpServer: HttpServer;
  private ioServer: IOServer;
  private shoppingListService: any;
  private port: number;

  constructor({ port, shoppingListService }: ServerConfig) {
    this.port = port;
    this.httpServer = createServer();
    this.ioServer = new IOServer(this.httpServer, {
      //
    });
    this.shoppingListService = shoppingListService;
    this.setupIOServer();
  }

  private setupIOServer(): void {
    this.ioServer.on('connection', (socket: Socket) => {
      socket.on('shoppingListItem:create', async (payload: any, cb) => {
        const saved = await this.shoppingListService.save({
          title: payload.title,
          completed: payload.completed,
        });
        cb({
          payload: {
            id: saved.id,
            title: saved.title,
            completed: saved.completed,
          },
        });
      });
    });
  }

  public start(cb?: () => void): void {
    this.httpServer.listen({ port: this.port }, () => {
      if (cb) {
        cb();
      }
    });
  }

  public stop(cb?: () => void): void {
    this.httpServer.close(() => {
      if (cb) {
        cb();
      }
    });
  }
}
