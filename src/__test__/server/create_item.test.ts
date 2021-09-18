import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import faker from 'faker';
import { server, mockedShoppingListService } from './test_setup';

describe('Server', () => {
  describe('create an item', () => {
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

    it('successfully creates an item', (done) => {
      const dummyItemInfo = {
        title: faker.lorem.words(3).slice(0, 50),
        completed: faker.datatype.boolean(),
      };
      const dummyItem = {
        id: faker.datatype.uuid(),
        title: dummyItemInfo.title,
        completed: dummyItemInfo.completed,
      };
      jest
        .spyOn(mockedShoppingListService, 'validateNewItem')
        .mockImplementationOnce(() => ({}));
      jest
        .spyOn(mockedShoppingListService, 'createItem')
        .mockImplementationOnce(() => Promise.resolve(dummyItem));

      clientSocket.emit(
        'shoppingListItem:create',
        dummyItemInfo,
        (response) => {
          expect(response.status).toBe('success');
          expect(response.payload).toMatchObject(dummyItem);
          done();
        },
      );
    });

    it('disconnects if a callback is missing', (done) => {
      const dummyItemInfo = {
        title: faker.lorem.words(3).slice(0, 50),
        completed: faker.datatype.boolean(),
      };

      clientSocket.emit('shoppingListItem:create', dummyItemInfo);

      clientSocket.on('disconnect', () => {
        done();
      });
    });

    it(`rejects to create an item with an invalid property
      and reports reasons`, (done) => {
      const dummyInvalidItemInfo = {
        title: '',
        completed: faker.datatype.boolean(),
      };
      jest
        .spyOn(mockedShoppingListService, 'validateNewItem')
        .mockImplementationOnce(() => ({
          error: {
            errors: {
              title: faker.lorem.sentence(),
            },
          },
        }));

      clientSocket.emit(
        'shoppingListItem:create',
        dummyInvalidItemInfo,
        (response) => {
          expect(response.status).toBe('fail');
          expect(response.payload).toMatchObject({
            title: expect.any(String),
          });
          done();
        },
      );
    });

    it('reports an error if an unexpected error occured', (done) => {
      const dummtItemInfo = {
        title: faker.lorem.word(3).slice(0, 50),
        completed: faker.datatype.boolean(),
      };
      const dummyErrorMessage = faker.lorem.word(3).slice(0, 50);
      jest
        .spyOn(mockedShoppingListService, 'validateNewItem')
        .mockImplementationOnce(() => ({}));
      jest
        .spyOn(mockedShoppingListService, 'createItem')
        .mockImplementationOnce(() => {
          throw new Error(dummyErrorMessage);
        });

      clientSocket.emit(
        'shoppingListItem:create',
        dummtItemInfo,
        (response) => {
          expect(response.status).toBe('error');
          expect(response.message).toEqual(expect.any(String));
          done();
        },
      );
    });
  });
});
