import { AggregateType } from './enums';
import { FieldDescription } from './table';

export type AggregateDescription = {
  type: AggregateType,
  name: string;
  field: FieldDescription,
}

export type Operator = {
  type: AggregateType,
  fields: string[],
};