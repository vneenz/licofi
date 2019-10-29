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
import {LineColumnFinder} from "@vneenz/licofi";
// or
const {LineColumnFinder} = require("@vneenz/licofi");

const string = "Hello\nWorld\n!";
const finder = new LineColumnFinder(string);

finder.fromIndex(6)
// -> {line: 2, column: 1}

finder.fromLineColumn({line: 2, column: 1})
// -> 6
```
