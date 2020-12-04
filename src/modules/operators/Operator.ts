import { Operator as IOperator } from 'Typings';

export default class Operator implements IOperator {
  type: IOperator['type'];
  fields: IOperator['fields'];

  static create(...args: ConstructorParameters<typeof Operator>) {
    return new Operator(...args);
  }
  constructor(type: IOperator['type'], ...fields: IOperator['fields']) {
    this.type = type;
    this.fields = fields;
  }
  toString() {
    return JSON.stringify(this);
  }
}