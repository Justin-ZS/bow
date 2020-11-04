import { ITable } from 'Typings';
import { makeFieldDesc } from 'Utils';
import { mapRecord } from 'PureUtils';

import { ArrayColumn } from './column'; // TODO: use IColumn from parameters

export const getCalculatedTable = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  calcOpts: Record<string, Function>,
  table: ITable,
) => {
  const calcNames = Object.keys(calcOpts);
  const newData = table.fields
    .map(f => f.name)
    .concat(calcNames)
    .reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
  
  table.traverse((rowIdx) => { // @TODO: performance!
    const rowData = table.getRowDataByIdx(rowIdx);
    const calcData = mapRecord(fn => fn(rowData), calcOpts);
    mapRecord((v, k) => newData[k].push(v), { ...rowData, ...calcData });
  });

  const fields = table.fields
    .filter(f => !calcNames.includes(f.name))
    .concat(calcNames.map(name => makeFieldDesc(name, 0, newData[name][0])))
    .map((f, idx) => makeFieldDesc(f.name, idx, f.type));

  return table.create(
    mapRecord(ArrayColumn.from, newData),
    {
      fields,
      rowCount: table.rowCount,
    },
  );
};