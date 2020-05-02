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


#### Columns
|Column|Description|
|------|-----------|
|lib|Name of library|
|memory usage|Heap memory usage|
|index|Time spent generating lookup indexes|
|query|Time spent searching|
|total|index + query|

Aborted means that library did not finish that benchmark within 10 seconds

#### very short text (10 lines), 344 queries
|lib|memory usage|index|query|total|
|-|-|-|-|-|
|find-line-column|354 kb|0 ms|1 ms|1 ms
|simple-text-buffer|140 kb|2 ms|3 ms|5 ms
|char-props|29 kb|0 ms|0 ms|0 ms
|vfile-location|35 kb|0 ms|1 ms|1 ms
|lines-and-columns|27 kb|0 ms|0 ms|0 ms
|string-pos|59 kb|0 ms|1 ms|1 ms
|vscode-textbuffer|109 kb|1 ms|0 ms|1 ms
|line-column|25 kb|0 ms|1 ms|1 ms
|licofi|23 kb|0 ms|0 ms|0 ms


#### short text (100 lines), 3988 queries
|lib|memory usage|index|query|total|
|-|-|-|-|-|
|find-line-column|3,650 kb|0 ms|28 ms|28 ms
|simple-text-buffer|861 kb|1 ms|24 ms|25 ms
|char-props|282 kb|0 ms|3 ms|3 ms
|vfile-location|220 kb|0 ms|2 ms|2 ms
|lines-and-columns|180 kb|0 ms|2 ms|2 ms
|string-pos|581 kb|0 ms|4 ms|4 ms
|vscode-textbuffer|761 kb|1 ms|6 ms|7 ms
|line-column|232 kb|0 ms|3 ms|3 ms
|licofi|168 kb|0 ms|2 ms|2 ms


#### medium text (1000 lines), 48598 queries
|lib|memory usage|index|query|total|
|-|-|-|-|-|
|find-line-column|10,699 kb|0 ms|3032 ms|3032 ms
|simple-text-buffer|6,643 kb|5 ms|268 ms|273 ms
|char-props|466 kb|0 ms|39 ms|39 ms
|vfile-location|221 kb|0 ms|22 ms|22 ms
|lines-and-columns|166 kb|2 ms|19 ms|21 ms
|string-pos|548 kb|0 ms|13 ms|13 ms
|vscode-textbuffer|2,335 kb|2 ms|10 ms|12 ms
|line-column|376 kb|0 ms|6 ms|6 ms
|licofi|308 kb|0 ms|6 ms|6 ms


#### long text (10000 lines), 50000 queries
|lib|memory usage|index|query|total|
|-|-|-|-|-|
|find-line-column||||ABORTED|
|simple-text-buffer|14,758 kb|31 ms|461 ms|492 ms
|char-props|1,346 kb|2 ms|406 ms|408 ms
|vfile-location|368 kb|2 ms|185 ms|187 ms
|lines-and-columns|415 kb|2 ms|157 ms|159 ms
|string-pos|903 kb|0 ms|19 ms|19 ms
|vscode-textbuffer|2,838 kb|2 ms|16 ms|18 ms
|line-column|765 kb|1 ms|8 ms|9 ms
|licofi|450 kb|2 ms|7 ms|9 ms


#### very long text (100000 lines), 50000 queries
|lib|memory usage|index|query|total|
|-|-|-|-|-|
|find-line-column||||ABORTED|
|simple-text-buffer|53,572 kb|194 ms|647 ms|841 ms
|char-props|10,321 kb|9 ms|3572 ms|3581 ms
|vfile-location|2,998 kb|5 ms|1785 ms|1790 ms
|lines-and-columns|2,959 kb|7 ms|1502 ms|1509 ms
|string-pos|6,318 kb|0 ms|29 ms|29 ms
|vscode-textbuffer|5,391 kb|8 ms|17 ms|25 ms
|line-column|4,208 kb|6 ms|9 ms|15 ms
|licofi|3,033 kb|5 ms|9 ms|14 ms


