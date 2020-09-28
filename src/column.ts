// abstract layer for vary column type

export interface IColumn<T = any> {
  getDatum: (index: number) => T,
  length: number,
}

export class ArrayColumn<T = any> implements IColumn<T> {
  private data: T[] = [];
  public readonly isArrayColumn = true;

  static create<T = any>(...args: ConstructorParameters<typeof ArrayColumn>) {
    return new ArrayColumn<T>(...args);
  }
  static from<T = any>(data: any): ArrayColumn {
    if (data.isArrayColumn) return data as ArrayColumn<T>;
    if (Array.isArray(data)) return ArrayColumn.create<T>(data);
    throw Error(`Not supported data type: ${typeof data}`);
  }

  constructor(data) {
    this.data = data;
  }

  get length() {
    return this.data.length;
  }

  getDatum(index: number) {
    return this.data[index];
  }
}