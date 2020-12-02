## Understanding evaluation contexts
> “The filter context filters the model; the row context iterates one table.”

1. Reclarify Terms
    1. Filter context :: TableView
    1. Row context :: Iteration
1. Measure <-> Calculated Column
    1. Measure :: no iteration until an iterator specified (`SUMX`, `FILTER`, ...)
        * In PowerBI visual, a measure always be used like `ADDCOLUMNS(GroupByTable, [Measure])`
    1. Calculated column :: implicit iteration on raw table
1. Types
```ts
// Dim | Val
//  x  |  1
//  y  |  2

type Scalar = unknown; // A single value of unknown type.

type Column = Scalar[];

type Table = {
  [fieldName: string]: Column,

  map: (row: Row) => Scalar
}

const table: Table = {
  Dim: ['x', 'y'],
  Val: [1, 2],
}

type Row = {
  [fieldName: string]: Scalar,
}

const Row: Row = {
  Dim: 'x',
  Val: 1,
}
```

4. Shadowed Table Expression
    * A `TableName` expression can be resolved to different types according to desired type and context
    * Within an iteration, `TableName` can be `Table`
    * Otherwise, `TableName` always be `Table`
    * As a `Table`, it's always affected by current filter context. (`TableView`)
    * As a `Row`, it's affected by filter context and **current** row context. (current row in iteration)
    * Accordingly, `ColumnName` becomes `Column` under `Table` or `Scalar` under `Row`

5. Examples
* `SUMX` in Calculated Column

```ts
Sales[SumOfSalesQuantity] = SUM( Sales[Quantity] )
// Equals to
Sales[SumOfSalesQuantity] = SUMX( Sales, Sales[Quantity] )
```

<img width="70%" src="./imgs/Screen Shot 2020-11-06 at 5.51.25 PM.png" /> 

```ts
const Sales = rawTable as Table;                    // original table data
const SalesView: Table = apply(filters, rawTable);  // TableView: groupBy
Sales['SumOfSalesQuantity'] = Sales.map(() =>       // Iteration: Calculated Column
    Math.sum(...SalesView.map(Sales =>              // Iteration: SUMX,
        Sales['Quantity'])));
```

* `EARLIER`: Resolve `ColumnName` within last iteration rather than current one. (nested iteration is required implicitly)

```ts
'Product'[UnitPriceRank] = COUNTROWS (  
  FILTER (  
    'Product',  
    'Product'[UnitPrice] > EARLIER ('Product'[UnitPrice])
  )
) + 1
```

<img width="70%" src="./imgs/Screen Shot 2020-11-06 at 5.57.56 PM.png" /> 

```ts
const Product = rawTable as Table;                    // original table data
const ProductView: Table = apply(filters, rawTable);  // TableView: groupBy
Product['UnitPriceRank'] = Product.map((Product) => { // Iteration: Calculated Column
    const EARLIER = Product['UnitPrice'];             // EARLIER ('Product'[UnitPrice])
    return COUNTROWS(ProductView.filter(Product =>    // Iteration: FILTER
        Product['UnitPrice'] > EARLIER)));
}
```

* Running Total
```ts
RunningTotal := CALCULATE(        // Iteration + CALCULATE = Context Transition
  SUM( Table['Amount'] ),
  FILTER(                         // Named OUTER_FILTER
    ALL( Table ) ,                // Remove Transitioned Filter
    COUNTROWS(                    // Iteration by OUTER_FILTER -> row in All Table -> VisibleRow    <-----------
      FILTER(                     // Named INNER_FILTER                                                        |
        Table,                    // Transitioned Filter + Table = single row TableView                        |
        EARLIER( Table['Date'] )  // Iteration by INNER_FILTER, EARLIER + Row          -------------------------
          <=
        Table['Date']             // Iteration by INNER_FILTER -> row in single row TableView -> CurrentRow
      )
    )   
  )
)
```

## Understanding CALCULATE
> "The only function to create a filter context"

```ts
CALCULATE ( Expression, Condition1, ... ConditionN )
```

1. The filter arguments are evaluated in the filter context that exists outside of the `CALCULATE` itself
    * In reality the engine uses lazy evaluation for the filter context
    * As a rule, `ALL*` functions are `CALCULATE` modifiers when used as top-level functions in `CALCULATE` filter arguments.
    * The `CALCULATE` modifiers are applied to the final filter context before explicit filter arguments
1. It **overwrites** filters on the same column, merges filters if they are on different columns.
    * **ALL** :: removes all filters that have been applied; same to `REMOVEFILTERS` when used as `CALCULATE` modifier
    * **ALLSELECTED** :: removes the filters attached by iteration on specified columns
    * **KEEPFILTERS** :: adds a new filter rather than overwriting an existing filter on the same column

```ts
const Table = rawTable as Table;
const calculate = (
  expr,             // measure expresion
  ...conditions,    // speficied filters or modifiers
  viewFilters,      // current filter context, added by engine automatically
  rowFilters,       // current row context, transitioned by engine automatically
) => {
  const [modifiers, args] = partial(isModifier, conditions);
  // its filter parameters get evaluated in the original filter context
  const argsFilters = args.map(arg => evaluate(viewFilters, arg));
  // the one induced by context transition is applied first and, then, the filter arguments are applied later
  const calcFilters = merge(modifiers)(viewFilters, rowFilters argsFilters); 
  return evaluate(calcFilters, expr);
}                                                                                                                    
```

3. Context Transition
    * If executed in a row context, `CALCULATE` invalidates the row context before evaluating its expression 
    * It automatically adds as filter arguments all the columns that are currently being iterated in any row context—filtering their actual value in the row being iterated.
4. Every measure reference always has an implicit `CALCULATE` surrounding it.
    * No row context anymore, existed filters may be overwrited. 

```ts
TotalSales = SUMX (                      // Sales of all the products
  Sales,                                 // Sales is not filtered
  Sales[Quantity] * Sales[Net Price]     // thus here we compute all sales
)

CurrentSales = CALCULATE (               // Performs context transition
  SUMX (
    Sales,                               // Sales of the current product only
    Sales[Quantity] * Sales[Net Price]   // thus here we compute sales of the current product only
  )
)
```

## Advanced DAX concepts
1. Expanded Table
    * `Expanded Table` = `Base Table` natural join all related tables
    * Expansion goes towards the one-side of a relationship and does not stop at the first level

```SQL
--  base_table -- N:1 --> relate_table_1
--      |
--      --------- N:1 --> relate_table_2 ---- N:1 --> relate_table_3

expanded_table AS (
  SELECT
    all, unique, columns,
  FROM
    base_table
  WHERE
    base_table
      LEFT JOIN relate_table_1 ON base_table.fk1 == relate_table_1.pk
      LEFT JOIN relate_table_2 ON base_table.fk2 == relate_table_2.pk
      LEFT JOIN relate_table_3 ON relate_table_2.fk == relate_table_3.pk
)
```

2. Table filter and Column filter
    * Column filter
        * Work on the base table
        * Does not refer to related columns
        * Filter all tables whose expanded table includes that column
        * The filter context is propagated from the one-side to many/one-side in a relationship
    * Table filter
        * Work on the expanded table
        * Alwasy includes related columns
        * Filter all tables included in the expaned table
        * The filter context is propagated from the many/one-side to one-side.

3. Examples
```ts
All Products = CALCULATE(
  COUNTROWS( `Product` ),
  ALL( Sales )
);

All Products Sold = CALCULATE(
  COUNTROWS( `Product` ),
  FILTER(
    ALL( Sales ),
    TRUE
  )
);
```

4. Conclusion
    * Never filter a table when you can filter a column

## The DAX engines

<img max-width="80%" src="./imgs/Screen Shot 2020-11-10 at 11.24.21 AM.png" />

1. VertiPaq
    1. in-memory columnar database
    1. compression
        1. Value Encoding:  
        <img width="60%" src="./imgs/Screen Shot 2020-11-06 at 1.40.39 PM.png" />
        1. Hash Encoding  
        <img width="60%" src="./imgs/Screen Shot 2020-11-06 at 1.43.08 PM.png" />
        1. Run Length Encoding (RLE)  
        <img width="60%" src="./imgs/Screen Shot 2020-11-06 at 1.45.17 PM.png" />
    1. The factors influencing the compression ratio of a Tabular model are, in order of importance:
        1. The cardinality of the column, which defines the number of bits used to store a value.
        2. The number of repetitions. A column with many repeated values is compressed more.
        3. The number of rows in the table.
        4. The data type of the column, which only affects the dictionary size.
    1. Finding the best sort order
        1. improve the efficiency of RLE, reduce the memory footprint of the model.
        1. Only when the data model is really large
    1. Relationships: pairs of IDs and row numbers  
        <img width="60%" src="./imgs/Screen Shot 2020-11-06 at 1.53.56 PM.png" />
    1. Pre-aggregation

1. DirectQuery  
    * [DirectQuery in Analysis Services](https://www.sqlbi.com/whitepapers/directquery-in-analysis-services-2016/)
