import { v4 as uuidv4 } from 'uuid';

interface ShoppingListItem {
  id: string;
  title: string;
  completed: boolean;
}

export class ShoppingListService {
  private items: ShoppingListItem[];

  constructor() {
    this.items = [];
  }

  public start(cb: () => void): void {
    cb();
  }

  public stop(cb: () => void): void {
    cb();
  }

  public save(itemInfo: {
    title: string;
    completed: boolean;
  }): Promise<ShoppingListItem> {
    const item = {
      id: uuidv4(),
      title: itemInfo.title,
      completed: itemInfo.completed,
    };

    this.items.push(item);

    return Promise.resolve(item);
  }

  public findById(id: string): Promise<ShoppingListItem> {
    return Promise.resolve(this.items.find((item) => item.id === id));
  }

  public findAll(): Promise<ShoppingListItem[]> {
    return Promise.resolve(this.items);
  }
}
