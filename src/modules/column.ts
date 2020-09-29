import { IColumn } from 'Typings';

// abstract layer for vary column type
export class ArrayColumn<T = unknown> implements IColumn<T> {
  private data: T[] = [];
  public readonly isArrayColumn = true;

  static create<T = unknown>(...args: ConstructorParameters<typeof ArrayColumn>) {
    return new ArrayColumn<T>(...args);
  }
  static from<T = unknown>(data: unknown): ArrayColumn {
    if ((data as any).isArrayColumn) return data as ArrayColumn<T>;
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