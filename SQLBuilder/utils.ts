import {
  SYMBOL, OrderingSpec, NullOrdering, SetQuantifier,
  WindowFrameBound, WindowFrameUnits, WindowFrameExclusion,
  ResultOffset, JoinType, TruthValue, ComparisonOperator,
  LogicalOperator
} from './constant';
import {
  JoinTableType
} from './enum';

type Unfinished = string;
type Identifier = string;
type ColumnRef = string;
type WindowFrameBoundString = string;
type WindowFrameBetweenString = string;
type SearchCondition = BoolExpr;
type WindowClause = string;
type WindowFrameClause = string;
type PartitionClause = string;
type OrderClause = string;
type GroupByClause = string;
type WhereClause = string;
type AsClause = string;
type HavingClause = string;
type WithClause = string;
type ResultOffsetClause = string;
type FromClause = string;
type WithElem = string;

const SPACE = ' ';
const SPACE_COMMA_SPACE = ` ${SYMBOL.comma} `;

const concatBy = (xs: string[], separator: string = SPACE) => xs.filter(i => i).join(separator);

export const clause = {
  window: (
    windowDefList: Unfinished[],
  ): WindowClause =>
    `WINDOW ${concatBy(windowDefList, SPACE_COMMA_SPACE)}`,

  frame: (
    unit: WindowFrameUnits,
    between: WindowFrameBetweenString,
    exclusion?: WindowFrameExclusion,
  ): WindowFrameClause =>
    concatBy([unit, between, exclusion]),

  partition: (
    colRefList: ColumnRef[],
  ): PartitionClause =>
    `PARTITION BY ${concatBy(colRefList, SPACE_COMMA_SPACE)}`,

  where: (searchCondition: SearchCondition): WhereClause => `WHERE ${searchCondition}`,

  having: (searchCondition: SearchCondition): HavingClause => `HAVING ${searchCondition}`,

  as: (columnName: Unfinished): AsClause => `AS ${columnName}`,

  groupBy: (
    groupingElementList: Unfinished[],
    setQuantifier?: SetQuantifier,
  ): GroupByClause =>
    `GROUP BY ${concatBy([setQuantifier, ...concatBy(groupingElementList, SPACE_COMMA_SPACE)])}`,

  orderBY: (sortSpecList: Unfinished[]): OrderClause => `ORDER BY ${concatBy(sortSpecList, SPACE_COMMA_SPACE)}`,

  filter: (searchCondition: SearchCondition) => `FILTER ${SYMBOL.leftParen} ${clause.where(searchCondition)} ${SYMBOL.rightParen}`,

  offset: (rowCount: PositiveInteger, row: ResultOffset): ResultOffsetClause => `OFFSET ${rowCount} ${row}`,

  from: (tableRefList: TableRef[]): FromClause => `FROM ${concatBy(tableRefList, SPACE_COMMA_SPACE)}`,

  with: (
    withElemList: WithElem[],
    recursive?: boolean,
  ): WithClause => concatBy([
    'WITH',
    recursive && 'RECURSIVE',
    concatBy(withElemList, SPACE_COMMA_SPACE),
  ]),
};

const selectTarget = (selectList: Unfinished[]) => {
  if (!selectList.length) return SYMBOL.asterisk;
  return concatBy(selectList, SPACE_COMMA_SPACE);
};

type SortSpec = string;
type QuerySpec = string;
export const spec = {
  sort: (
    sortKey: Unfinished,
    orderingSpec?: OrderingSpec,
    NullOrdering?: NullOrdering,
  ): SortSpec =>
    concatBy([sortKey, orderingSpec, NullOrdering]),
  window: (partitionBy?: PartitionClause, orderBy?: OrderClause, frame?: WindowFrameClause) =>
    concatBy([partitionBy, orderBy, frame]),
  query: (
    selectList: Unfinished[],
    tableExpr: TableExpr,
  ): QuerySpec =>
    `SELECT ${selectTarget(selectList)} ${tableExpr}`,
};

export const window = {
  framePreceding: (rowCount: PositiveInteger) => `${rowCount} PRECEDING`,
  frameFollowing: (rowCount: PositiveInteger) => `${rowCount} FOLLOWING`,
  frameBound: (type: WindowFrameBound, rowCount?: PositiveInteger): WindowFrameBoundString => {
    if (type === WindowFrameBound.Preceding) return window.framePreceding(rowCount);
    if (type === WindowFrameBound.Following) return window.frameFollowing(rowCount);
    return type;
  },
  frameBetween: (bound1: WindowFrameBoundString, bound2: WindowFrameBoundString): WindowFrameBetweenString =>
    `BETWEEN ${bound1} AND ${bound2} `,
};

type JoinCondition = string;
type TableFactor = string;
type JoinedTable = string;
type TableRef = TableFactor | JoinedTable;

export const table = {
  joinOn: (searchCondition: SearchCondition): JoinCondition => `ON ${searchCondition}`,

  crossJoin: (
    leftTable: TableRef,
    rightTable: TableFactor,
  ): JoinedTable =>
    `${leftTable} CROSS JOIN ${rightTable}`,

  qualifiedJoin: (
    leftTable: TableRef,
    rightTable: TableRef,
    joinType: JoinType,
    joinCondition: JoinCondition,
  ): JoinedTable =>
    concatBy([leftTable, `${joinType} JOIN`, rightTable, joinCondition]),

  joinedTable: (
    type: JoinTableType,
    leftTable: TableRef,
    rightTable: TableFactor,
    argus: any[],
  ): JoinedTable => {
    switch (type) {
      case JoinTableType.CrossJoin:
        return table.crossJoin(leftTable, rightTable);
      case JoinTableType.QualifiedJoin:
        // @ts-ignore
        return table.qualifiedJoin(leftTable, rightTable, ...argus);
      default:
        throw Error('QueryUtils: Not Support Yet!');
    }
  }
};

type SubQuery = string;

const subQuery = (
  queryExpr: Unfinished,
): SubQuery => concatBy([
  SYMBOL.leftParen,
  queryExpr,
  SYMBOL.rightParen,
]);

const withElem = (
  queryName: Identifier,
  subQuery: SubQuery,
  colNameList?: Unfinished[],
): WithElem => concatBy([
  queryName,
  colNameList && concatBy([
    SYMBOL.leftParen,
    concatBy(colNameList, SPACE_COMMA_SPACE),
    SYMBOL.rightParen
  ]),
  'AS',
  subQuery,
]);

type TableExpr = string;
type BoolExpr = string;
type QueryExpr = string;
export const expression = {
  table: (
    from: FromClause,
    where?: WhereClause,
    groupBy?: GroupByClause,
    having?: HavingClause,
    window?: WindowClause,
  ): TableExpr =>
    concatBy([
      from,
      where,
      groupBy,
      having,
      window,
    ]),

  bool: (
    boolTerm: BooleanTerm,
    boolExpr?: BoolExpr
  ): BoolExpr =>
    concatBy([
      boolExpr,
      boolExpr && LogicalOperator.Or,
      boolTerm
    ]),

  query: (
    queryBody: Unfinished,
    withClause?: WithClause,
    orderClause?: OrderClause,
    resultOffsetClause?: ResultOffsetClause,
  ): QueryExpr => concatBy([
    withClause,
    queryBody,
    orderClause,
    resultOffsetClause,
  ])
};

type Predicate = string;
const predicates = {
  inValueList: (colRef: ColumnRef, inValueList: Unfinished[], exclude?: boolean): Predicate =>
    concatBy([colRef, exclude && 'NOT', 'IN', SYMBOL.leftParen, concatBy(inValueList, SPACE_COMMA_SPACE), SYMBOL.rightParen]),
  inSubQuery: (colRef: ColumnRef, subQuery: Unfinished, exclude?: boolean): Predicate =>
    concatBy([colRef, exclude && 'NOT', 'IN', subQuery]),
  like: (colRef: ColumnRef, pattern: Unfinished, exclude?: boolean, escape?: Unfinished): Predicate =>
    concatBy([colRef, exclude && 'NOT', 'LIKE', pattern, escape]),
  null: (colRef: ColumnRef, exclude?: boolean): Predicate =>
    concatBy([colRef, 'IS', exclude && 'NOT', 'NULL']),
  comparison: (colRef: ColumnRef, compOp: ComparisonOperator, rowValue: Unfinished): Predicate =>
    concatBy([colRef, compOp, rowValue]),
};

type BooleanPrimary = Predicate | ColumnRef;
type BooleanTest = string;
type BooleanFactor = string | BooleanTest;
type BooleanTerm = string | BooleanFactor;

const boolTest = (boolPrim: BooleanPrimary, value?: TruthValue, exclude?: boolean): BooleanTest =>
  concatBy([boolPrim, value && 'IS', exclude && 'NOT', value]);
const boolFactor = (boolTest: BooleanTest, exclude?: boolean): BooleanFactor =>
  concatBy([exclude && 'NOT', boolTest]);
const boolTerm = (boolFactor: BooleanTest, boolTerm?: BooleanTerm): BooleanTerm =>
  concatBy([boolTerm, boolTerm && LogicalOperator.And, boolFactor]);