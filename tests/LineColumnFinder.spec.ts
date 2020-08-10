import {LineColumnFinder} from "../src/index";

it("works with unix line endings", () => {
    const str = "hello\nworld!";
    const index = str.indexOf("!");

    const finder = new LineColumnFinder(str, {lineBreak: "\n"});
    const result = finder.fromIndex(index);

    expect(result).toEqual({line: 2, column: 6});
});


it("works with windows line endings", () => {
    const str = "hello\r\nworld!";
    const index = str.indexOf("!");

    const finder = new LineColumnFinder(str, {lineBreak: "\r\n"});
    const result = finder.fromIndex(index);

    expect(result).toEqual({line: 2, column: 6});
})

it("works with >1k lines", () => {
    const lines = [
        "Maecenas porta tellus ac metus aliquet egestas.",
        "Phasellus id arcu a felis tristique consectetur eget ut risus.",
        "Etiam sollicitudin nisl non arcu mattis auctor.",
        "Morbi porttitor nibh nec bibendum auctor.",
        "Nunc sed augue in mi tempor maximus in in erat.\n"
    ];

    const str = lines.join("\n").repeat(300);

    const index = str.lastIndexOf("nec");
    let finder = new LineColumnFinder(str, {lineBreak: "\n"});
    let result = finder.fromIndex(index);

    expect(result).toEqual({line: 1499, column: 22});

    finder = new LineColumnFinder(str, {origin: 0});
    result = finder.fromIndex(index);

    expect(result).toEqual({line: 1498, column: 21});
});

it("throws exception when invalid index is specified", () => {
    const str = "hello\nworld";
    const finder = new LineColumnFinder(str);

    expect(() => finder.fromIndex(-1)).toThrow();
    expect(() => finder.fromIndex(11)).toThrow();
    expect(() => finder.fromIndex(200)).toThrow();
    expect(() => finder.fromIndex(NaN)).toThrow();

    // @ts-ignore
    expect(() => finder.fromIndex(null)).toThrow();
});

it("can convert from line/column to index", () => {
    const unixStr = "hello\nworld\n!";
    const winStr = "hello\r\nworld\r\n!";

    let unix = new LineColumnFinder(unixStr);
    let windows = new LineColumnFinder(winStr, {lineBreak: "\r\n"});

    let index = unix.fromLineColumn({line: 3, column: 1});
    expect(index).toBe(12);

    index = unix.fromLineColumn({line: 2, column: 3});
    expect(index).toBe(8);

    index = windows.fromLineColumn({line: 3, column: 1});
    expect(index).toBe(14);

    index = windows.fromLineColumn({line: 2, column: 3});
    expect(index).toBe(9);

    unix = new LineColumnFinder(unixStr, {origin: 0});
    index = unix.fromLineColumn({line: 2, column: 0});
    expect(index).toBe(12);

    index = unix.fromLineColumn({line: 1, column: 2});
    expect(index).toBe(8);
});

it("throws exception when invalid line/column is specified", () => {
    const str = "hello\nworld";
    const finder = new LineColumnFinder(str);

    expect(() => finder.fromLineColumn({line: 3, column: 1})).toThrow();
    expect(() => finder.fromLineColumn({line: 2, column: 6})).toThrow();
    expect(() => finder.fromLineColumn({line: 1, column: 0})).toThrow();
});

it("correct behavior for empty lines and empty file", () => {
    const emptyLines = new LineColumnFinder("\n\n");
    const emptyFile = new LineColumnFinder("");

    let index = emptyLines.fromLineColumn({line: 1, column: 1});
    expect(index).toBe(0);

    index = emptyLines.fromLineColumn({line: 2, column: 1});
    expect(index).toBe(1);

    // should return 2? See Issue #12
    expect(() => emptyLines.fromLineColumn({line: 3, column: 1})).toThrow();

    // should return 0? See Issue #12
    expect(() => emptyFile.fromLineColumn({line: 1, column: 1})).toThrow();
});

it("toString of LineColumn reports correctly", () => {
    const str = "hello\nworld";
    const finder = new LineColumnFinder(str);


    expect(finder.fromIndex(8).toString()).toBe("2:3")
    expect(finder.fromIndex(2).toString()).toBe("1:3")
    
    expect(finder.fromIndex(1).toVerboseString()).toBe("Line: 1, Column: 2")
    expect(finder.fromIndex(5).toVerboseString()).toBe("Line: 1, Column: 6")
});
