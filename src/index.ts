
interface LineColumn {
    line: number;
    column: number;
}

interface Options {
    lineBreak?: string;
    indexOrigin?: number;
}

type Required<T> = {
    [key in keyof T]-?: NonNullable<T[key]>;
};

const DEFAULT_OPTIONS: Required<Options> = {
    lineBreak: "\n",
    indexOrigin: 1
};

function findClosestIndex(needle: number, haystack: number[]) {
    let min = 0;
    let max = haystack.length - 1;

    let mid = 0;

    while(true) {
        // Faster way of doing
        // mid = min + Math.floor((max - min) / 2)
        mid = min + ((max - min) >> 1);

        if(min > max) return mid;

        if(needle >= haystack[mid]) {
            min = mid + 1;
        } else {
            max = mid - 1;
        }
    }
}

class LineColumnFinder {

    private source: string;
    private options: Required<Options>;
    private lineCache: number[];

    constructor(source: string, options?: Options) {
        this.source = source;
        this.lineCache = [];
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);

        this.initCache();
    }

    private initCache() {
        let index = 0;

        const offset = this.options.lineBreak.length;

        for(let i = 0;; i++) {
            this.lineCache.push(index);

            index = this.source.indexOf(this.options.lineBreak, index);
            if(index === -1) break;
            index += offset;
        }
    }

    fromLineColumn(from: LineColumn) {
        const line = from.line - this.options.indexOrigin;
        const column = from.column - this.options.indexOrigin;

        if(line < 0) throw Error("Invalid line number");
        if(column < 0) throw Error("Invalid column");

        if(line >= this.lineCache.length) {
            throw Error(`Specified line number ${from.line} exceeds number of lines`);
        }

        const index = this.lineCache[line];

        const nextLineStart = line === this.lineCache.length - 1 ?
            this.source.length : this.lineCache[line + 1];

        const lineLength = nextLineStart - index;

        if(column >= lineLength) {
            throw Error(`Column ${from.column} does not exist on line ${from.line}`);
        }

        return index + column;
    }

    fromIndex(index: number): LineColumn {
        if(index > this.source.length || index < 0)
            throw Error("Invalid index");

        const line = findClosestIndex(index, this.lineCache);
        const column = index - this.lineCache[line];

        return {
            line: line + this.options.indexOrigin,
            column: column + this.options.indexOrigin
        };
    }

}

export {
    LineColumnFinder
};
