import { v4 as uuidv4 } from 'uuid';
import { Schema } from 'joi';

interface IShoppingListItem {
  id: string;
  title: string;
  completed: boolean;
}

export class ShoppingListService {
  private items: IShoppingListItem[];
  private shoppingListItemSchema: Schema;
  private isValidationError: (obj: any) => boolean;

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
  }): Promise<IShoppingListItem> {
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

  public findById(id: string): Promise<IShoppingListItem> {
    return Promise.resolve(this.items.find((item) => item.id === id));
  }

  public findAll(): Promise<IShoppingListItem[]> {
    return Promise.resolve(this.items);
  }
}
