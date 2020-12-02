export enum PredicateType {
  Comparison,
  Between,
  In,
  Like,
  Similar,
  RegexLike,
  Null,
  QuantifiedPredicate,
  Unique,
  Match,
  Overlaps,
  Distinct,
  Member,
  Submultiset,
  Set,
  Type,
  Period,
  JSON,
  JSONExists,
}

export enum WindowFunctionType {
  Rank,
  RowNumber,
  Aggregate,
  Ntile,
  LeadLag,
  FirstLast,
  NthValue,
  WindowRowPatternMeasure,
}

export enum ValueExpression {
  CommonValue,
  BooleanValue,
  RowValue,
}

export enum JoinTableType {
  CrossJoin,
  QualifiedJoin,
  NaturalJoin,
}

export enum BooleanTestType {
  TruthValue,
}