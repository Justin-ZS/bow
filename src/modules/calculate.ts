import { ITable } from 'Typings';
import { mapRecord } from 'PureUtils';
import { TableEx } from 'Extensions';

export const getCalculatedTable = (
  calcOpts: Record<string, Function>,
  table: ITable,
) => {
  const newData = table.fields
    .map(f => f.name)
    .concat(Object.keys(calcOpts))
    .reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
  
  table.traverse((rowIdx) => { // @TODO: performance!
    const rowData = table.getRowDataByIdx(rowIdx);
    const calcData = mapRecord(fn => fn(rowData), calcOpts);
    mapRecord((v, k) => newData[k].push(v), { ...rowData, ...calcData });
  });
  
  return TableEx.fromColumns(newData);
};