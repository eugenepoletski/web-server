import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { Server as IOServer, Socket } from 'socket.io';

interface ServerConfig {
  port: number;
  shoppingListService: any;
}

interface ServiceValidationError {
  error: {
    details: [];
  };
}

function isServiceValidationError(obj: any): obj is ServiceValidationError {
  return 'error' in obj;
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
        try {
          const item = await this.shoppingListService.create({
            title: payload.title,
            completed: payload.completed,
          });
          cb({
            payload: {
              id: item.id,
              title: item.title,
              completed: item.completed,
            },
          });
        } catch (err: any) {
          const payload = {};

          if (isServiceValidationError(err)) {
            const validationError: ServiceValidationError = err;

            for (const {
              message,
              context: { key },
            } of validationError.error.details) {
              payload[key] = message;
            }

            return cb({
              status: 'fail',
              payload,
            });
          }
        }
      });

      socket.on('shoppingListItem:list', async (cb) => {
        const itemList = await this.shoppingListService.findAll();
        cb({
          payload: itemList,
        });
      });
    });
  }

  public address(): string | AddressInfo {
    return this.httpServer.address();
  }

  public async start(cb?: () => void): Promise<void> {
    await new Promise<void>((res) => {
      this.httpServer.listen({ port: this.port }, () => {
        if (cb) {
          cb();
        }
        res();
      });
    });
  }

  public async stop(cb?: () => void): Promise<void> {
    await new Promise<void>((res) => {
      this.httpServer.close(() => {
        if (cb) {
          cb();
        }
        res();
      });
    });
  }
}
