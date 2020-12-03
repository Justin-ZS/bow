## Expression
1. [Parse]((https://github.com/acornjs/acorn)) expression into AST
    * Expr: `agg.sum('Price')`
    * [AST](https://astexplorer.net/#/gist/a672636ae0d200e6d59c0eae92f548d9/8f97e62f25de38e9ede33cacf13ef6c006878dcd)
1. Transform AST to internal AST
    * [Transformed AST](https://astexplorer.net/#/gist/a672636ae0d200e6d59c0eae92f548d9/5e465224ef521c8be8d69926fc04b7f67090fd43)
1. [Generate](https://github.com/estools/escodegen) code(`d => agg.sum(d.Price)`) from internal AST
    * EScode: `t => agg.sum(t['Price'])`