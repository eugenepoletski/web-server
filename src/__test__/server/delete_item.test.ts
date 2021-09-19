import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import faker from 'faker';
import { server, mockedShoppingListService } from './test_setup';
import { createPartialDone } from '../test_helpers';
import { ShoppingListService } from '../../services/shoppingList';

describe('Server', () => {
  describe('delete an item', () => {
    let clientSocket;

    beforeEach(() => {
      clientSocket = Client(
        `http://localhost:${(server.address() as AddressInfo).port}`,
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      clientSocket.close();
    });

    it('successfully deletes an item', (done) => {
      const dummyItem = {
        id: faker.datatype.uuid(),
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      };
      jest
        .spyOn(mockedShoppingListService, 'deleteItem')
        .mockImplementationOnce(() => Promise.resolve(dummyItem));

      clientSocket.emit('shoppingListItem:delete', dummyItem.id, (response) => {
        expect(response.status).toBe('success');
        done();
      });
    });

    it('disconnects if a callback is missing', (done) => {
      const dummyItemId = faker.datatype.uuid();

      clientSocket.emit('shoppingListItem:delete', dummyItemId);

      clientSocket.on('disconnect', () => {
        done();
      });
    });

    it(`rejects to delete an item if its id is missing
      and reports a reason`, (done) => {
      const partialDone = createPartialDone(3, done);
      let dummyItemId = undefined;

      clientSocket.emit('shoppingListItem:delete', dummyItemId, (response) => {
        expect(response.status).toBe('fail');
        expect(response.payload).toMatchObject({ itemId: expect.any(String) });
        partialDone();
      });

      dummyItemId = null;
      clientSocket.emit('shoppingListItem:delete', dummyItemId, (response) => {
        expect(response.status).toBe('fail');
        expect(response.payload).toMatchObject({ itemId: expect.any(String) });
        partialDone();
      });

      dummyItemId = '';
      clientSocket.emit('shoppingListItem:delete', dummyItemId, (response) => {
        expect(response.status).toBe('fail');
        expect(response.payload).toMatchObject({ itemId: expect.any(String) });
        partialDone();
      });
    });

    it(`rejects to delete an item if not found and reports a reason`, (done) => {
      const dummyItemId = faker.datatype.uuid();
      jest
        .spyOn(mockedShoppingListService, 'deleteItem')
        .mockImplementationOnce(() =>
          Promise.reject(
            new mockedShoppingListService.NotFoundError(faker.lorem.sentence()),
          ),
        );

      clientSocket.emit('shoppingListItem:delete', dummyItemId, (response) => {
        expect(response.status).toBe('fail');
        expect(response.payload).toMatchObject({
          itemId: expect.any(String),
        });
        done();
      });
    });

    it('reports an error if an unexpected error occured', (done) => {
      const dummyItemId = faker.datatype.uuid();
      jest
        .spyOn(mockedShoppingListService, 'deleteItem')
        .mockImplementationOnce(() =>
          Promise.reject(new Error(faker.lorem.sentence())),
        );

      clientSocket.emit('shoppingListItem:delete', dummyItemId, (response) => {
        expect(response.status).toBe('error');
        expect(response).toMatchObject({
          message: expect.any(String),
        });
        done();
      });
    });
  });
});
