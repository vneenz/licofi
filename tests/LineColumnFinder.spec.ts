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
    const finder = new LineColumnFinder(str, {lineBreak: "\n"});
    const result = finder.fromIndex(index);

    expect(result).toEqual({line: 1499, column: 22});
});

it("can convert from line/column to index", () => {
    const str = "hello\nworld\n!";
    const str2 = "hello\r\nworld\r\n!";

    const unix = new LineColumnFinder(str);
    const windows = new LineColumnFinder(str2);

    let index = unix.fromLineColumn({line: 3, column: 1});
    expect(index).toBe(12);

    index = unix.fromLineColumn({line: 2, column: 3});
    expect(index).toBe(8);

    index = windows.fromLineColumn({line: 3, column: 1});
    expect(index).toBe(14);

    index = windows.fromLineColumn({line: 2, column: 3});
    expect(index).toBe(9);

});

it("throws exception when invalid line/column is specified", () => {
    const str = "hello\nworld";
    const finder = new LineColumnFinder(str);

    expect(() => {
        finder.fromLineColumn({line: 3, column: 1})
    }).toThrow();

    expect(() => {
        finder.fromLineColumn({line: 2, column: 6});
    }).toThrow();

    const ind = finder.fromLineColumn({line: 2, column: 5});
    expect(ind).toBe(10);

});
