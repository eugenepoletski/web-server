import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import { Server as IOServer, Socket } from 'socket.io';
import { inspect } from 'util';

export type ItemId = string;

export interface Item {
  id: ItemId;
  title: string;
  completed: boolean;
}

export interface NewItemInfo {
  title: string;
  completed?: boolean;
}

export interface ItemUpdateInfo {
  title?: string;
  completed?: boolean;
}

export interface ValidationReport {
  error?: {
    errors: {
      [key: string]: {
        message: string;
      };
    };
  };
}

export interface Service {
  createItem(newItemInfo: NewItemInfo): Promise<Item | never>;
  updateItem(itemId: ItemId, itemUpdate: ItemUpdateInfo): Promise<Item | never>;
  findAll(): Promise<Item[] | never>;
  findItemById(itemId: ItemId): Promise<Item | never>;
  validateNewItem(newItemInfo: NewItemInfo): ValidationReport;
  validateItemUpdate(itemUpdateInfo: ItemUpdateInfo): ValidationReport;
  NotFoundError: any;
}

export interface ServerConfig {
  port: number;
  shoppingListService: Service;
  logger: any;
}

const obj2str = (obj) => inspect(obj, { showHidden: false });

export class Server {
  private httpServer: HttpServer;
  private ioServer: IOServer;
  private shoppingListService: Service;
  private logger: any;
  private port: number;

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
        message: `shoppingListItem connection socket id=${socket.id}`,
      });

      socket.on('disconnect', () => {
        this.logger.info({
          message: `shoppingListItem disconnect socket id=${socket.id}`,
        });
      });

      socket.on(
        'shoppingListItem:create',
        async (itemInfo: NewItemInfo, cb) => {
          this.logger.info({
            message: `shoppingListItem:create itemInfo=${obj2str(itemInfo)}`,
          });

          if (typeof cb !== 'function') {
            this.logger.debug({
              message: 'shoppingListItem:create missing callback',
            });
            return socket.disconnect();
          }

          const validationReport =
            this.shoppingListService.validateNewItem(itemInfo);

          if (validationReport.error) {
            this.logger.warn({
              message: `shoppingListItem:create fail reason=${obj2str(
                validationReport.error.errors,
              )}`,
            });

            return cb({
              status: 'fail',
              payload: validationReport.error.errors,
            });
          }

          try {
            const item = await this.shoppingListService.createItem({
              title: itemInfo.title,
              completed: itemInfo.completed,
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
            // eslint-disable-next-line max-len
            this.logger.error({
              message: `shoppingListItem:create error ${obj2str(err)}`,
            });
            cb({
              status: 'error',
              message: err.message,
            });
          }
        },
      );

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

      socket.on(
        'shoppingListItem:update',
        async (itemId: ItemId, itemUpdate: ItemUpdateInfo, cb) => {
          this.logger.info({
            // eslint-disable-next-line max-len
            message: `shoppingListItem:update itemId=${itemId} itemUpdate=${obj2str(
              itemUpdate,
            )}`,
          });

          if (typeof cb !== 'function') {
            this.logger.debug({
              message: 'shoppingListItem:update missing callback',
            });
            return socket.disconnect();
          }

          if (!itemId) {
            this.logger.warn({
              message: `shoppingListItem:update invalid itemId=${itemId}`,
            });
            return cb({
              status: 'fail',
              payload: {
                itemId: `invalid itemId=${itemId}`,
              },
            });
          }

          const validationReport =
            this.shoppingListService.validateItemUpdate(itemUpdate);

          if (validationReport.error) {
            this.logger.warn(
              `shoppingListItem:update fail reason=${obj2str(
                validationReport.error.errors,
              )}`,
            );

            return cb({
              status: 'fail',
              payload: validationReport.error.errors,
            });
          }

          try {
            const updatedItem = await this.shoppingListService.updateItem(
              itemId,
              itemUpdate,
            );

            this.logger.info({
              // eslint-disable-next-line max-len
              message: `shoppingListItem:update success item=${obj2str(
                updatedItem,
              )}`,
            });

            cb({
              status: 'success',
              payload: {
                id: updatedItem.id,
                title: updatedItem.title,
                completed: updatedItem.completed,
              },
            });
          } catch (err) {
            switch (true) {
              case err instanceof this.shoppingListService.NotFoundError:
                const reason = { itemId: `item with id=${itemId} not found` };
                this.logger.warn(
                  `shoppingListItem:update fail reason=${obj2str(reason)}`,
                );
                return cb({
                  status: 'fail',
                  payload: reason,
                });
              default:
                this.logger.error({
                  message: `shoppingListItem:update error ${obj2str(err)}`,
                });
                cb({
                  status: 'error',
                  message: err.message,
                });
            }
          }
        },
      );

      socket.on('shoppingListItem:read', async (itemId: ItemId, cb) => {
        this.logger.info({ message: `shoppingListItem:read itemId=${itemId}` });

        if (typeof cb !== 'function') {
          this.logger.debug({
            message: 'shoppingListItem:read missing callback',
          });
          return socket.disconnect();
        }

        if (!itemId) {
          this.logger.warn({
            message: `shoppingListItem:read invalid itemId=${itemId}`,
          });
          return cb({
            status: 'fail',
            payload: {
              itemId: `invalid itemId=${itemId}`,
            },
          });
        }

        try {
          const item = await this.shoppingListService.findItemById(itemId);

          this.logger.info({
            // eslint-disable-next-line max-len
            message: `shoppingListItem:read success item=${obj2str(item)}`,
          });

          cb({
            status: 'success',
            payload: item,
          });
        } catch (err) {
          switch (true) {
            case err instanceof this.shoppingListService.NotFoundError:
              const reason = { itemId: `item with id=${itemId} not found` };
              this.logger.warn(
                `shoppingListItem:read fail reason=${obj2str(reason)}`,
              );
              return cb({
                status: 'fail',
                payload: reason,
              });
            default:
              this.logger.error({
                message: `shoppingListItem:read error ${obj2str(err)}`,
              });
              cb({
                status: 'error',
                message: err.message,
              });
          }
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
          message: `shoppingListItem server stopped listening
            on port=${this.port}`,
        });
      });
    });
  }
}
