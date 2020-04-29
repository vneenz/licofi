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
        lineAndCol: (text, stochasticOffsets) => {
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                findLineColumn(text, stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
        }
    },
    {
        name: "simple-text-buffer",
        lineAndCol: (text, stochasticOffsets) => {
            const buff = new textBuffer(text)
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                buff.positionForCharacterIndex(stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
        }
    },
    {
        name: "char-props",
        lineAndCol: (text, stochasticOffsets) => {
            const cp = charProps(text)
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                cp.lineAt(stochasticOffsets[next])
                cp.columnAt(stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
        }
    },
    {
        name: "string-pos",
        lineAndCol: (text, stochasticOffsets) => {
            stringPos(text.short, 0)
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                stringPos(text, stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
        }
    },
    {
        name: "vfile-location",
        lineAndCol: (text, stochasticOffsets) => {
            const vfl = vfileLocation(vfile(text))
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                vfl.toPosition(stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
        }
    },
    {
        name: "lines-and-columns",
        lineAndCol: (text, stochasticOffsets) => {
            const lac = new linesAndColumns(text)
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                lac.locationForIndex(stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
        }
    },
    {
        name: "vscode-textbuffer",
        lineAndCol: (text, stochasticOffsets) => {
            const pieceTreeTextBufferBuilder = new vscode.PieceTreeTextBufferBuilder()
            pieceTreeTextBufferBuilder.acceptChunk(text)
            const pieceTreeFactory = pieceTreeTextBufferBuilder.finish(true)
            const pieceTree = pieceTreeFactory.create(1)
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                pieceTree.getPositionAt(stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
        }
    },
    {
        name: "line-column",
        lineAndCol: (text, stochasticOffsets) => {
            const lc = lineColumn(text)
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                lc.fromIndex(stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
        }
    },
    {
        name: "licofi",
        lineAndCol: (text, stochasticOffsets) => {
            const lcf = new licofi(text)
            let len = stochasticOffsets.length
            let next = 0
            return function() {
                lcf.fromIndex(stochasticOffsets[next])
                next++
                if (next === len) next = 0
            }
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


function randomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
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

    const numOffsets = Math.min(text.length * 2, 50000)
    const stochasticOffsets = new Array(numOffsets)
    for (let m = 0; m < numOffsets; m++) {
        stochasticOffsets[m] = randomInt(0, text.length-1)
    }

    const suite = createSuite(textCase.name + " text: " + len + " chars, " + lines + " lines")
    for (let k = 0, len2 = candidates.length; k < len2; k++) {
        const c = candidates[k]
        suite.add(c.name, c.lineAndCol(text, stochasticOffsets))
    }
    suite.run()
}
