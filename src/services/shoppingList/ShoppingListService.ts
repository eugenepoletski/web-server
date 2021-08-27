import { v4 as uuidv4 } from 'uuid';
import { Schema } from 'joi';

interface Item {
  id: string;
  title: string;
  completed: boolean;
}

interface ItemUpdate {
  title?: string;
  completed?: boolean;
}

export class ShoppingListService {
  private items: Item[];
  private shoppingListItemSchema: Schema;
  public isValidationError: (obj: any) => boolean;

  constructor({
    isValidationError,
    shoppingListItemSchema,
  }: {
    isValidationError: (obj: any) => boolean;
    shoppingListItemSchema: Schema;
  }) {
    this.items = [];
    this.shoppingListItemSchema = shoppingListItemSchema;
    this.isValidationError = isValidationError;
  }

  public start(cb: () => void): void {
    cb();
  }

  public stop(cb: () => void): void {
    cb();
  }

  public create(itemInfo: {
    title: string;
    completed: boolean;
  }): Promise<Item> {
    const validationReport = this.shoppingListItemSchema.validate({
      title: itemInfo.title,
      completed: itemInfo.completed,
    });

    if (this.isValidationError(validationReport)) {
      return Promise.reject(validationReport);
    }

    const item = {
      id: uuidv4(),
      title: itemInfo.title,
      completed: itemInfo.completed,
    };

    this.items.push(item);

    return Promise.resolve(item);
  }

  public findById(id: string): Promise<Item> {
    return Promise.resolve(this.items.find((item) => item.id === id));
  }

  public findAll(): Promise<Item[]> {
    return Promise.resolve(this.items);
  }

  public async update(id: string, itemUpdate: ItemUpdate): Promise<Item> {
    const storedItem = await this.findById(id);
    // ToDo! Add whitelisting of allowed properties
    const updatedItem = { ...storedItem, ...itemUpdate };
    const nextItems = this.items.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return updatedItem;
    });
    this.items = nextItems;
    return Promise.resolve(updatedItem);
  }
}
