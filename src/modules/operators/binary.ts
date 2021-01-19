import { BinaryOp } from 'Typings';

const makeOp = (type: BinaryOp['type']) => (left: any, right: any): BinaryOp => ({ type, right, left });

export const add = makeOp('+');
export const sub = makeOp('-');
export const mul = makeOp('*');
export const div = makeOp('/');
export const rem = makeOp('%');
export const exp = makeOp('**');

export const symbolMapping = {
  '+': 'add',
  '-': 'sub',
  '*': 'mul',
  '/': 'div',
  '%': 'rem',
  '**': 'exp',
};