export const SYMBOL = {
  space: ' ',
  doubleQuote: '"',
  percent: '%',
  ampersand: '&',
  leftParen: '(',
  rightParen: ')',
  asterisk: '*',
  plusSign: '+',
  comma: ',',
  minusSign: '-',
  period: '.',
  solidus: '/',
  reverseSolidus: '\\',
  colon: ':',
  semiColon: ';',
  lessThanOperator: '<',
  greaterThanOperator: '>',
  questionMark: '?',
  leftBracket: '[',
  rightBracket: ']',
  circumflex: '^',
  underscore: '_',
  verticalBar: '|',
  leftBrace: '{',
  rightBrace: '}',
  dollarSign: '$',
  apostrophe: '\'',
};

export enum TruthValue {
  True = 'TRUE',
  False = 'FALSE',
  Unknown = 'UNKNOWN'
}

export enum rankFunctionType {
  Rank = 'RANK',
  DenseRank = 'DENSE_RANK',
  PercentRank = 'PERCENT_RANK',
  CumeDist = 'CUME_DIST',
}

export enum LeadOrLag {
  Lead = 'LEAD',
  Lag = 'LAG',
}

export enum FromFirstOrLast {
  First = 'FROM FIRST',
  Last = 'FROM LAST'
}

export enum OrderingSpec {
  Asc = 'ASC',
  Desc = 'DESC',
}

export enum NullOrdering {
  NullFirst = 'NULLS FIRST',
  NullLast = 'NULLS LAST',
}

export enum ComputationalOperation {
  Avg = 'AVG',
  Max = 'MAX',
  Min = 'MIN',
  Sum = 'SUM',
  Every = 'EVERY',
  Any = 'ANY',
  Some = 'SOME',
  Count = 'COUNT',
  StddevPop = 'STDDEV_POP',
  StddevSamp = 'STDDEV_SAMP',
  VarSamp = 'VAR_SAMP',
  VarPop = 'VAR_POP',
  Collect = 'COLLECT',
  Fusion = 'FUSION',
  INTERSECTION = 'INTERSECTION',
}

export enum SetQuantifier {
  Distinct = "DISTINCT",
  All = "ALL",
}

export enum WindowFrameUnits {
  Rows = 'ROWS',
  Range = 'RANGE',
  Groups = 'GROUPS',
}

export enum WindowFrameBound {
  Preceding = 'PRECEDING',
  Following = 'FOLLOWING',
  UnboundedPreceding = 'UNBOUNDED PRECEDING',
  UnboundedFollowing = 'UNBOUNDED FOLLOWING',
  CurrentRow = 'CURRENT ROW',
}

export enum WindowFrameExclusion {
  CurrentRow = 'EXCLUDE CURRENT ROW',
  Group = 'EXCLUDE GROUP',
  Ties = 'EXCLUDE TIES',
  NoOthers = 'EXCLUDE NO OTHERS',
}

export enum ResultOffset {
  Row = 'ROW',
  Rows = 'ROWS',
}

export enum JoinType {
  Left = 'LEFT',
  Right = 'RIGHT',
  Full = 'FULL',
  Inner = 'INNER'
}

export enum ComparisonOperator {
  Equals = '=' ,
  NotEqual = '<>' ,
  LessThan = '<' ,
  LessThanOrEquals = '<=' ,
  GreaterThan = '>' ,
  GreaterThanOrEquals = '>=' ,
}

export enum LogicalOperator {
  And = 'AND',
  Or = 'OR',
}