
interface Result {
    line: number;
    column: number;
}

interface Options {
    lineBreak: string;
    indexOrigin: number;
}

const DEFAULT_OPTIONS: Options = {
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
    private options: Options;
    private lineCache: number[];

    constructor(source: string, options: Options) {
        this.source = source;
        this.lineCache = [];
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);

        this.initCache();
    }

    private initCache() {
        let index = 0;

        for(let i = 0;; i++) {
            this.lineCache.push(index);

            index = this.source.indexOf(this.options.lineBreak, index);
            if(index === -1) break;
            index++;
        }
    }

    find(searchIndex: number): Result {
        if(searchIndex > this.source.length || searchIndex < 0)
            throw Error("Invalid index");

        const line = findClosestIndex(searchIndex, this.lineCache);
        const column = searchIndex - this.lineCache[line];

        return {
            line: line + this.options.indexOrigin,
            column: column + this.options.indexOrigin
        };
    }

}

export {
    LineColumnFinder
};
