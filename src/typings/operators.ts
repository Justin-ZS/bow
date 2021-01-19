import { AggregateType } from './enums';
import { FieldDescription } from './table';

export type AggregateDescription = {
  type: AggregateType,
  name?: string;
  field: FieldDescription,
}

export type BinaryOp = {
  type: '+' | '-' | '*' | '/' | '%' | '**',
  left: any,
  right: any,
}

export type AggregateOp = {
  type: AggregateType,
  fields: string[],
};

export type Operator = AggregateOp | BinaryOp;