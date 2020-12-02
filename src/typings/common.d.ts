// contains all reuseable business-independent typings

declare type Id = string; // meaningless universal unique identifier
declare type Name = string; // meaningful identifier
declare type DateTime = string; // "2014-09-28T00:00:00"

declare type Integer = number;
declare type PositiveInteger = number;
declare type NonNegativeInteger = number; // natural number

declare type Predicate = (val: unknown) => boolean;
declare type Comparator = (a, b) => number;
declare type IndexSet = Set<number>;
declare type IndexArr = Array<number>;