"use strict"

const Benchmark = require("benchmark")
const benchmarks = require("beautify-benchmark")
const chalk = require("chalk")

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
    return new Benchmark.Suite(name, options).on("start", function () {
        console.log(chalk.blue(name))
    }).on("cycle", function (event) {
        benchmarks.add(event.target)
    }).on("complete", function () {
        benchmarks.log()
    })
}


function randomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}


const textCases = [
    {
        name: "very short",
        lines: 10
    },
    {
        name: "short",
        lines: 100
    },
    {
        name: "medium",
        lines: 1000
    },
    {
        name: "long",
        lines: 10000
    },
    {
        name: "very long",
        lines: 100000
    }
]

const Macbeth =
`That which hath made them drunk hath made me bold;
What hath quench'd them hath given me fire.
Hark! Peace!
It was the owl that shriek'd, the fatal bellman,
Which gives the stern'st good-night. He is about it:
The doors are open; and the surfeited grooms
Do mock their charge with snores: I have drugg'd 
their possets,
That death and nature do contend about them,
Whether they live or die.

[Within] Who's there? what, ho!

Alack, I am afraid they have awaked,
And 'tis not done. The attempt and not the deed
Confounds us. Hark! I laid their daggers ready;
He could not miss 'em. Had he not resembled
My father as he slept, I had done't.

*Enter MACBETH*

My husband!

I have done the deed. Didst thou not hear a noise?

I heard the owl scream and the crickets cry.
Did not you speak?

When?

Now.

As I descended?

Ay.`.split("\n")


function generateText (lines) {
    let buf = ''
    const max = Macbeth.length - 1
    for (let i = 0; i < lines; i++) {
        buf += Macbeth[randomInt(0, max)]
        buf += "\n"
    }
    return buf
}

for (let j = 0; j < textCases.length; j++) {
    const textCase = textCases[j]

    const text = generateText(textCase.lines)

    const numOffsets = Math.min(text.length * 2, 50000)
    const stochasticOffsets = new Array(numOffsets)
    for (let m = 0; m < numOffsets; m++) {
        stochasticOffsets[m] = randomInt(0, text.length-1)
    }

    const suite = createSuite(textCase.name + " text: " + text.length + " chars, " + textCase.lines + " lines")
    for (let k = 0; k < candidates.length; k++) {
        const c = candidates[k]
        suite.add(c.name, c.lineAndCol(text, stochasticOffsets), {
            'onError': (event) => {console.log(c.name, "benchmark error:", event.target.error)},
          }
        )
    }
    suite.run()
}
