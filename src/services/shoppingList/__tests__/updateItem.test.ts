import faker from 'faker';
import { ShoppingListService } from '../ShoppingListService';

describe('Update an item', () => {
  const shoppingListService = new ShoppingListService();

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

  it.skip('validates item update info', async () => {
    // const dummyInvalidItemUpdate = { title: 23, completed: 'true' };
    // const result = await shoppingListService.validateUpdateItem(
    //   dummyInvalidItemUpdate,
    // );
    // expect(result).toMatchObject({
    //   error: {
    //     errors: {
    //       title: {
    //         message: expect.any(String),
    //       },
    //       completed: {
    //         message: expect.any(String),
    //       },
    //     },
    //   },
    // });
  });

  it.skip(`rejects to update an item with an invalid property
  and report reasons`, async () => {
    const oldDummyItem = await shoppingListService.createItem({
      title: faker.lorem.sentence().slice(0, 50),
      completed: faker.datatype.boolean(),
    });
    const dummyFaultyItemUpdate = { title: '' };

    await expect(
      shoppingListService.updateItem(oldDummyItem.id, dummyFaultyItemUpdate),
    ).rejects.toThrow(
      expect.objectContaining({
        error: expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(String),
              context: expect.objectContaining({
                key: 'title',
              }),
            }),
          ]),
        }),
      }),
    );
  });
});
