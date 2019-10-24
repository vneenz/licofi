import {LineColumnFinder} from "../src/index";

it("works with unix line endings", () => {
    const str = ["hello", "world!"].join("\n");
    const index = str.indexOf("!");

    const finder = new LineColumnFinder(str, {lineBreak: "\n"});
    const result = finder.find(index);

    expect(result).toEqual({line: 2, column: 6});
});


it("works with windows line endings", () => {
    const str = ["hello", "world!"].join("\r\n");
    const index = str.indexOf("!");

    const finder = new LineColumnFinder(str, {lineBreak: "\r\n"});
    const result = finder.find(index);

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
    const result = finder.find(index);

    expect(result).toEqual({line: 1499, column: 22});
});
