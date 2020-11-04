import { ITable, OutputTableEx, InputTableEx } from 'Typings';
import { inferDataType, makeFieldDesc } from 'Utils';
import { Table, ArrayColumn } from 'Modules';

// limit = 0 -> no limit
const getRowCount = (table: ITable, limit = 0) => {
  let rowCount = table.rowCount;
  if (limit) rowCount = Math.min(limit, rowCount);
  return rowCount;
};

const getTableData = (table: ITable, limit: number): unknown[][] => {
  const names = table.fields.map(f => f.name);
  const data = [];
  table.traverse((rowIdx, done) => {
    data.push(names.reduce((acc, name) => {
      acc[name] = table.getCell(name, rowIdx);
      return acc;
    }, []));
    if (rowIdx >= limit) done();
  });
  return data;
};

// #region output table data
const toConsole = (table: ITable, limit: number) => {
  const rowCount = getRowCount(table, limit);

  console.log(`${table[Symbol.toStringTag]}. Showing ${rowCount} rows.`);
  console.table(getTableData(table, rowCount));
};

const tableTemplate = (headers: string[], data: unknown[][], footer?: string) => `
<table>
  <thead>
    <tr>
      ${headers
    .map(header => `<th>${header}</th>`)
    .join('\n      ')}
    </tr>
  </thead>
  <tbody>
    ${data
    .map(row => `<tr>${headers
      .map(header => `<td>${row[header]}</td>`)
      .join('')}</tr>`)
    .join('\n    ')}
  </tbody>
  ${footer
    ? `<tfoot>
      <tr>
        <td colspan="1000">
          ${footer}
        </td>
      </tr>
    </tfoot>`
    : ''}
</table>
`;
const toHTML = (table: ITable, limit = 0) => {
  const names = table.fields.map(f => f.name);

  const rowCount = getRowCount(table, limit);
  const data = getTableData(table, rowCount);
  const footer = `${table[Symbol.toStringTag]}. Showing ${rowCount} rows.`;

  return tableTemplate(names, data, footer);
};

// #endregion
const outputs: Record<string, OutputTableEx> = {
  toConsole,
  toHTML,
};

// #region create table instance from difference data source
type ColumnsTable = Record<string, unknown[]>

const fromColumns = (columns: ColumnsTable) => {
  const data = Object.entries(columns)
    .reduce((acc, [key, value]) => {
      acc[key] = ArrayColumn.from(value);
      return acc;
    }, {});

  const fields = Object.keys(columns)
    .map((name, idx) =>
      makeFieldDesc(name, idx, inferDataType(columns[name][0])));

  const fstField = fields[0];
  const rowCount = fstField
    ? columns[fstField.name].length
    : 0;

  return Table.create(data, { fields, rowCount });
};

// #endregion
const inputs: Record<string, InputTableEx> = {
  fromColumns,
};

export const TableEx = {
  ...outputs,
  ...inputs,
};