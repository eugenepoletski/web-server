import faker from 'faker';
import { ShoppingListService } from './ShoppingListService';
import { shoppingListItemSchema } from './schemas/ShoppingListItemSchema';

describe('Shopping List service', () => {
  let shoppingListService;

  beforeEach((done) => {
    shoppingListService = new ShoppingListService({ shoppingListItemSchema });
    shoppingListService.start(() => {
      done();
    });
  });

  afterEach((done) => {
    shoppingListService.stop(() => {
      done();
    });
  });

  describe('Create a shopping list item entity', () => {
    it('should create an item', async () => {
      const dummyItem = {
        title: faker.lorem.words(3).slice(0, 50),
        completed: faker.datatype.boolean(),
      };

      const resultItem = await shoppingListService.create(dummyItem);

      expect(typeof resultItem.id === 'string').toBe(true);
      expect(resultItem.title).toBe(dummyItem.title);
      expect(resultItem.completed).toBe(dummyItem.completed);

      const createdItem = await shoppingListService.findById(resultItem.id);

      expect(createdItem.id).toBe(resultItem.id);
      expect(createdItem.title).toBe(dummyItem.title);
      expect(createdItem.completed).toBe(dummyItem.completed);
    });

    it('should reject if title is missing', (done) => {
      const dummyItem = {
        title: '',
        completed: faker.datatype.boolean(),
      };

      shoppingListService.create(dummyItem).catch((err) => {
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

  describe('Return items list', () => {
    it('should return a list of entities', async () => {
      const createdItem1 = await shoppingListService.create({
        title: faker.lorem.words(2),
        completed: faker.datatype.boolean(),
      });

      const createdItem2 = await shoppingListService.create({
        title: faker.lorem.words(2),
        completed: faker.datatype.boolean(),
      });

      const itemList = await shoppingListService.findAll();

      expect(itemList).toContain(createdItem1);
      expect(itemList).toContain(createdItem2);
    });
  });
});
