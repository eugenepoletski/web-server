import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { Server as IOServer, Socket } from 'socket.io';
import { inspect } from 'util';

type Primitives = string | number | boolean | null;
type Json = { [key: string]: Primitives | Primitives[] | Json[] | Json };

export interface Item {
  id: string;
  title: string;
  completed: boolean;
}

export interface Service {
  createItem(itemInfo: Json): Promise<Item>;
  findAll(): Promise<Item[]>;
  isValidationError(obj: any): boolean;
}

interface ServerConfig {
  port: number;
  shoppingListService: Service;
  logger: any;
}

// ToDo! import this
interface ServiceValidationError {
  error: {
    details: [];
  };
}

const obj2str = (obj) => inspect(obj, { showHidden: false });

export class Server {
  private httpServer: HttpServer;
  private ioServer: IOServer;
  private shoppingListService: Service;
  private port: number;
  private logger: any;

  constructor({ port, shoppingListService, logger }: ServerConfig) {
    this.port = port;
    this.httpServer = createServer();
    this.ioServer = new IOServer(this.httpServer, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['*'],
      },
    });
    this.shoppingListService = shoppingListService;
    this.logger = logger;
    this.setupIOServer();
  }

  private setupIOServer(): void {
    this.ioServer.on('connection', (socket: Socket) => {
      // eslint-disable-next-line max-len
      this.logger.info({
        message: `connection socket id=${socket.id}`,
      });

      socket.on('disconnect', () => {
        this.logger.info({ message: `disconnect socket id=${socket.id}` });
      });

      socket.on('shoppingListItem:create', async (payload: Json, cb) => {
        // eslint-disable-next-line max-len
        this.logger.info({
          message: `shoppingListItem:create payload=${obj2str(payload)}`,
        });
        if (typeof cb !== 'function') {
          // eslint-disable-next-line max-len
          this.logger.debug({
            message: 'shoppingListItem:create missing callback',
          });
          return socket.disconnect();
        }

        try {
          const item = await this.shoppingListService.createItem({
            title: payload.title,
            completed: payload.completed,
          });
          // eslint-disable-next-line max-len
          this.logger.info({
            message: `shoppingListItem:create success item=${obj2str(item)}`,
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

            // eslint-disable-next-line max-len
            this.logger.warn({
              message: `shoppingListItem:create fail reason=${obj2str(
                payload,
              )}`,
            });

            return cb({
              status: 'fail',
              payload,
            });
          }

          // eslint-disable-next-line max-len
          this.logger.error({
            message: `shoppingListItem:create error ${obj2str(err)}`,
          });
          cb({
            status: 'error',
            message: err.message,
          });
        }
      });

      socket.on('shoppingListItem:list', async (cb) => {
        if (typeof cb !== 'function') {
          // eslint-disable-next-line max-len
          this.logger.debug({
            message: 'shoppingListItem:list missing callback',
          });
          return socket.disconnect();
        }

        try {
          const itemList = await this.shoppingListService.findAll();
          // eslint-disable-next-line max-len
          this.logger.info({
            message: `shoppingListItem:list success items=${obj2str(itemList)}`,
          });
          cb({
            status: 'success',
            payload: itemList,
          });
        } catch (err) {
          // eslint-disable-next-line max-len
          this.logger.error({
            message: `shoppingListItem:list error ${obj2str(err)}`,
          });
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
        // eslint-disable-next-line max-len
        this.logger.info(
          `shoppingListItem server started listening on port=${this.port}`,
        );
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
        // eslint-disable-next-line max-len
        this.logger.info({
          message: `shoppingListItem server stopped listening on port=${this.port}`,
        });
      });
    });
  }
}
