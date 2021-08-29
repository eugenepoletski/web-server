import faker from 'faker';
import { ShoppingListService } from './ShoppingListService';
import { shoppingListItemSchema } from './schemas/ShoppingListItemSchema';
import { isValidationError } from './utils';

describe('Shopping List service', () => {
  let shoppingListService;

  beforeEach((done) => {
    shoppingListService = new ShoppingListService({
      shoppingListItemSchema,
      isValidationError,
    });
    shoppingListService.start(() => {
      done();
    });
  });

  afterEach((done) => {
    shoppingListService.stop(() => {
      done();
    });
  });

  describe('Create an item', () => {
    it('successfully creates an item', async () => {
      const dummyItem = {
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      };

      const resultItem = await shoppingListService.createItem(dummyItem);

      expect(typeof resultItem.id === 'string').toBe(true);
      expect(resultItem.title).toBe(dummyItem.title);
      expect(resultItem.completed).toBe(dummyItem.completed);

      const createdItem = await shoppingListService.findById(resultItem.id);

      expect(createdItem.id).toBe(resultItem.id);
      expect(createdItem.title).toBe(dummyItem.title);
      expect(createdItem.completed).toBe(dummyItem.completed);
    });

    it(`rejects to create an item with an invalid property
      and reports reasons`, (done) => {
      const dummyItem = {
        title: '',
        completed: faker.datatype.boolean(),
      };

      shoppingListService.createItem(dummyItem).catch((err) => {
        expect(err).toHaveProperty('error');
        expect(err.error).toHaveProperty('details');
        expect(err.error.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              context: expect.objectContaining({
                key: expect.any(String),
              }),
            }),
          ]),
        );
        done();
      });
    });
  });

  describe('Retrieve items list', () => {
    it('returns a list of items', async () => {
      const createdItem1 = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });

      const createdItem2 = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });

      const itemList = await shoppingListService.findAll();

      expect(itemList).toContain(createdItem1);
      expect(itemList).toContain(createdItem2);
    });
  });

  describe('Retrieve an item by id', () => {
    it('retrieves an item by its id', async () => {
      const dummyItem = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });

      const foundDummyItem = await shoppingListService.findById(dummyItem.id);

      expect(foundDummyItem).toMatchObject(dummyItem);
    });
  });

  describe('Update an item', () => {
    it('successfully updates an item', async () => {
      const oldDummyItem = await shoppingListService.createItem({
        title: faker.lorem.sentence().slice(0, 50),
        completed: faker.datatype.boolean(),
      });
      const newDummyTitle = faker.lorem.sentence().slice(0, 50);

      const updatedDummyItem = await shoppingListService.updateItem(
        oldDummyItem.id,
        { title: newDummyTitle },
      );

      expect(updatedDummyItem).toMatchObject({
        id: oldDummyItem.id,
        title: newDummyTitle,
        completed: oldDummyItem.completed,
      });
    });
  });
});
