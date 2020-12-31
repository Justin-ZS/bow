## Expression
1. [Parse]((https://github.com/acornjs/acorn)) expression into AST
    * Expr: `agg.sum('Price')`
    * [AST](https://astexplorer.net/#/gist/a672636ae0d200e6d59c0eae92f548d9/8f97e62f25de38e9ede33cacf13ef6c006878dcd)
1. Transform AST to internal AST
    * [Transformed AST](https://astexplorer.net/#/gist/a672636ae0d200e6d59c0eae92f548d9/5e465224ef521c8be8d69926fc04b7f67090fd43)
1. [Generate](https://github.com/estools/escodegen) code(`d => agg.sum(d.Price)`) from internal AST
    * EScode: `t => agg.sum(t['Price'])`

## Types
### Built-in Operator
1. Example: `{ SumOfPrice: op.sum('Price') }`
1. Evaluation
    ```ts
    // origin
    {
      SumOfPrice: {
        type: 'sum',
        fields: ['Price']
      }
    }
    // transform
    {
      SumOfPrice: (t, op) => op.sum(t['Price'])
    }
    // collect ops
    {
      "(t, op) => op.sum(t['Price'])": (t, op) => op.sum(t['Price'])
    }
    ops => ({
      SumOfPrice: ops["(t, op) => op.sum(t['Price'])"]
    })
    // evaluate
    (ops => ({
      SumOfPrice: ops["(t, op) => op.sum(t['Price'])"]
    }))({
      "(t, op) => op.sum(t['Price'])": 1500
    })
    // result
    {
      SumOfPrice: 1500
    }
    ```
### Array Function
1. Example: `{ SumOfPrice: (op) => op.sum('Price') * 0.8 }`
1. Evaluation
    ```ts
    // origin
    {
      SumOfPrice: (op) => op.sum('Price') * 0.8
    }
    // transform
    {
      SumOfPrice: (op) => op.mul(op.sum(t['Price']), 0.8)
    }
    // evaluate
    {
      SumOfPrice: {
        type: 'multiplication',
        left: {
          type: 'sum',
          fields: ['Price']
        },
        right: 0.8
      }
    }
    // transform
    {
      SumOfPrice: {
        type: 'multiplication',
        left: (t, op) => op.sum(t['Price']),
        right: 0.8
      }
    }
    // collect ops
    {
      "(t, op) => op.sum(t['Price'])": (t, op) => op.sum(t['Price'])
    }
    ops => ({
      SumOfPrice: ops["(t, op) => op.sum(t['Price'])"] * 0.8
    });
    
    // evaluate
    {
      "(t, op) => op.sum(t['Price'])": {
        agg: SumAggregator,
        getter: row => row['Price']
      }
    }
    // evaluate
    (ops => ({
      SumOfPrice: ops["(t, op) => op.sum(t['Price'])"] * 0.8
    }))({
      "(t, op) => op.sum(t['Price'])": 1500
    })
    // transform
    {
      SumOfPrice: 1500 * 0.8
    }
    ```
### Formula (Optional)
1. Example: `[SumOfPrice] = SUM([Price])`
1. Evaluation
    ```ts
    // origin
    "[SumOfPrice] = SUM([Price])"
    // parse
    {
      SumOfPrice: {
        type: 'sum',
        fields: ['Price']
      }
    }
    // same as before
    ```