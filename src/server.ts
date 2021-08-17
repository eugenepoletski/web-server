import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { Server as IOServer, Socket } from 'socket.io';

type Primitives = string | number | boolean | null;
type Json = { [key: string]: Primitives | Primitives[] | Json[] | Json };

export interface Item {
  id: string;
  title: string;
  completed: boolean;
}

export interface Service {
  create(itemInfo: Json): Promise<Item>;
  findAll(): Promise<Item[]>;
  isValidationError(obj: any): boolean;
}

interface ServerConfig {
  port: number;
  shoppingListService: Service;
}

// ToDo! import this
interface ServiceValidationError {
  error: {
    details: [];
  };
}

export class Server {
  private httpServer: HttpServer;
  private ioServer: IOServer;
  private shoppingListService: Service;
  private port: number;

  constructor({ port, shoppingListService }: ServerConfig) {
    this.port = port;
    this.httpServer = createServer();
    this.ioServer = new IOServer(this.httpServer, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['*'],
      },
    });
    this.shoppingListService = shoppingListService;
    this.setupIOServer();
  }

  private setupIOServer(): void {
    this.ioServer.on('connection', (socket: Socket) => {
      socket.on('shoppingListItem:create', async (payload: Json, cb) => {
        if (typeof cb !== 'function') {
          return socket.disconnect();
        }

        try {
          const item = await this.shoppingListService.create({
            title: payload.title,
            completed: payload.completed,
          });
          cb({
            status: 'success',
            payload: {
              id: item.id,
              title: item.title,
              completed: item.completed,
            },
          });
        } catch (err: any) {
          const payload = {};

          if (this.shoppingListService.isValidationError(err)) {
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

          cb({
            status: 'error',
            message: err.message,
          });
        }
      });

      socket.on('shoppingListItem:list', async (cb) => {
        if (typeof cb !== 'function') {
          return socket.disconnect();
        }

        try {
          const itemList = await this.shoppingListService.findAll();

          cb({
            payload: itemList,
          });
        } catch (err) {
          cb({
            status: 'error',
            message: err.message,
          });
        }
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
