class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
    this.name = 'NotFoundError';
  }
}

export class MockedShoppingListService {
  public createItem(): any {
    jest.fn();
  }

  public deleteItem(): any {
    jest.fn();
  }

  public findAll(): any {
    jest.fn();
  }

  public findItemById(): any {
    jest.fn();
  }

  public updateItem(): any {
    jest.fn();
  }

  public validateNewItem(): any {
    jest.fn();
  }

  public validateItemUpdate(): any {
    jest.fn();
  }

  public NotFoundError = NotFoundError;
}
