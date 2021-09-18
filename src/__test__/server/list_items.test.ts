import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import faker from 'faker';
import { server, mockedShoppingListService } from './test_setup';

describe('Server', () => {
  describe('list items', () => {
    let clientSocket;

    beforeEach(() => {
      // eslint-disable-next-line max-len
      clientSocket = Client(
        `http://localhost:${(server.address() as AddressInfo).port}`,
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      clientSocket.close();
    });

    it('successfully returns a list of items', (done) => {
      const dummyItem1 = {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(3).slice(0, 50),
        completed: faker.datatype.boolean(),
      };
      const dummyItem2 = {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(1).slice(0, 50),
        completed: faker.datatype.boolean(),
      };
      const dummyItem3 = {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(2).slice(0, 50),
        completed: faker.datatype.boolean(),
      };

      jest
        .spyOn(mockedShoppingListService, 'findAll')
        .mockImplementation(() =>
          Promise.resolve([dummyItem1, dummyItem2, dummyItem3]),
        );

      clientSocket.emit('shoppingListItem:list', (response) => {
        expect(response.status).toBe('success');
        const dummyItemList = response.payload;
        expect(dummyItemList).toHaveLength(3);
        expect(dummyItemList).toEqual(
          expect.arrayContaining([dummyItem3, dummyItem1, dummyItem2]),
        );
        done();
      });
    });

    it('disconnects if a callback is missing', (done) => {
      clientSocket.emit('shoppingListItem:list');

      clientSocket.on('disconnect', () => {
        done();
      });
    });

    it('reports an error if an unexpected error occured', (done) => {
      const dummyErrorMessage = faker.lorem.sentence();

      jest
        .spyOn(mockedShoppingListService, 'findAll')
        .mockImplementationOnce(() => {
          throw new Error(dummyErrorMessage);
        });

      clientSocket.emit('shoppingListItem:list', (response) => {
        expect(response.status).toBe('error');
        expect(response.message).toBe(dummyErrorMessage);
        done();
      });
    });
  });
});
