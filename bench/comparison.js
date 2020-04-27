"use strict"

const Benchmark = require("benchmark")
const benchmarks = require("beautify-benchmark")
const chalk = require("chalk")
const shuffle = require("array-shuffle")

const findLineColumn = require("find-line-column")
const textBuffer = require("simple-text-buffer")
const charProps = require("char-props")
const stringPos = require("string-pos")
const vfile = require("vfile")
const vfileLocation = require("vfile-location")
const linesAndColumns = require("lines-and-columns")["default"]
const vscode = require("vscode-textbuffer")
const lineColumn = require("line-column")
const licofi = require("../dist").LineColumnFinder

const candidates = [
    {
        name: "find-line-column",
        lineAndCol: (text, target) => {
            return () => findLineColumn(text, target)
        }
    },
    {
        name: "simple-text-buffer",
        lineAndCol: (text, target) => {
            const buff = new textBuffer(text)
            return () => buff.positionForCharacterIndex(target)
        }
    },
    {
        name: "char-props",
        lineAndCol: (text, target) => {
            const cp = charProps(text)
            return () => ({ line: cp.lineAt(target), column: cp.columnAt(target) })
        }
    },
    {
        name: "string-pos",
        lineAndCol: (text, target) => {
            stringPos(text.short, 0)
            return () => stringPos(text, target)
        }
    },
    {
        name: "vfile-location",
        lineAndCol: (text, target) => {
            const vfl = vfileLocation(vfile(text))
            return () => vfl.toPosition(target)
        }
    },
    {
        name: "lines-and-columns",
        lineAndCol: (text, target) => {
            const lac = new linesAndColumns(text)
            return () => lac.locationForIndex(target)
        }
    },
    {
        name: "vscode-textbuffer",
        lineAndCol: (text, target) => {
            const pieceTreeTextBufferBuilder = new vscode.PieceTreeTextBufferBuilder()
            pieceTreeTextBufferBuilder.acceptChunk(text)
            const pieceTreeFactory = pieceTreeTextBufferBuilder.finish(true)
            const pieceTree = pieceTreeFactory.create(1)
            return () => pieceTree.getPositionAt(target)
        }
    },
    {
        name: "line-column",
        lineAndCol: (text, target) => {
            const lc = lineColumn(text)
            return () => lc.fromIndex(target)
        }
    },
    {
        name: "licofi",
        lineAndCol: (text, target) => {
            const lcf = new licofi(text)
            return () => lcf.fromIndex(target)
        }
    }
]

const createSuite = function (name, options) {
    return Benchmark.Suite(name, options).on("start", function () {
        return console.log(chalk.dim(name))
    }).on("cycle", function () {
        return benchmarks.add(arguments[0].target)
    }).on("complete", function () {
        return benchmarks.log()
    })
}

const textCases = [
    {
        name: "short",
        lines: 5
    },
    {
        name: "medium",
        lines: 50
    },
    {
        name: "long",
        lines: 500
    },
    {
        name: "very long",
        lines: 5000
    }
]

const loremIpsum = "Lorem ipsum dolor sit amet\nconsectetur adipiscing elit.\nSuspendisse id sem vel mi cursus facilisis vel ac arcu.\nNulla vulputate tortor eu ipsum bibendum rhoncus"

for (let j = 0, len1 = textCases.length; j < len1; j++) {
    const textCase = textCases[j]
    const text = ((function () {
        const results = []
        for (let i = 0, k = 0, ref = textCase.lines; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
            results.push(shuffle(loremIpsum.split("\n")))
        }
        return results
    })()).join("\n")
    const len = text.length
    const lines = stringPos(text, len).line
    const target = Math.round(text.length / 2 + ((text.length / 2) * 0.34))
    const suite = createSuite(textCase.name + " text: " + len + " chars, " + lines + " lines")
    for (let k = 0, len2 = candidates.length; k < len2; k++) {
        const c = candidates[k]
        suite.add(c.name, c.lineAndCol(text, target))
    }
    suite.run()
}
