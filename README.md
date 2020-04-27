# licofi

Micro library for converting index in a string to line/column
and back

## API

### LineColumnFinder(sourceString, options = {})
#### Options
|Key|Description|Default|
|---|-----------|-------|
|lineBreak|What character sequence to treat as linebreak|"\n"|
|origin|Set to 0 to use zero-based line/column numbering|1|

### LineColumnFinder.fromIndex(index)
Convert index to line/column. Provided index should be zero-based.

Example return value:
```js
{line: 1, column: 5}
```

### LineColumnFinder.fromLineColumn({line, column})
Convert line/column to index in source string.
Returned index is zero-based.

## Example
```js
import {LineColumnFinder} from "licofi";
// or
const {LineColumnFinder} = require("licofi");

const string = "Hello\nWorld\n!";
const finder = new LineColumnFinder(string);

finder.fromIndex(6)
// -> {line: 2, column: 1}

finder.fromLineColumn({line: 2, column: 1})
// -> 6
```

## Benchmarks
#### Benchmark parameters
String length: 805160 characters  
Number of lines: 5000

|package|speed (ops/sec)|
|-------|---------------|
|simple-text-buffer |    304,221|
|char-props         |    287,185|
|string-pos         |  6,876,880|
|vfile-location     |    462,939|
|lines-and-columns  |    543,310|
|vscode-textbuffer  | 12,331,948|
|line-column        | 53,926,711|
|licofi             | 69,056,486|

* Benchmark ran with Nodejs 14 on a computer with Ryzen 3700x processor
