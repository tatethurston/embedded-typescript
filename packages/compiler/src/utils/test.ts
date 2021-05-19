import {
  sanitizeString,
  trimLeadingIndentation,
  trimLaggingNewline,
  getLeadingIndentation,
  trimLeadingIndentationAndNewline,
} from ".";

describe(sanitizeString, () => {
  it.each([
    ["'hello'", "\\'hello\\'"],
    ["don't", "don\\'t"],
    [
      `this
is`,
      "this\\nis",
    ],
  ])("sanitizeString(%s)", (input, expected) => {
    expect(sanitizeString(input)).toEqual(expected);
  });
});

describe(getLeadingIndentation, () => {
  it.each([
    ["t", ""],
    [" t", ""],
    ["t  ", ""],
    ["  ", "  "],
    [
      `
       `,
      "       ",
    ],
    ["\t  ", "\t  "],
    ["\n\n  ", "  "],
    ["\n\n\n", ""],
    ["\n\t  ", "\t  "],
  ])("getLeadingIndentation(%s)", (input, expected) => {
    expect(getLeadingIndentation(input)).toEqual(expected);
  });
});

describe(trimLeadingIndentation, () => {
  it.each([
    ["t", "t"],
    [" t", " t"],
    ["t  ", "t  "],
    ["  ", ""],
    [
      `
       `,
      "\n",
    ],
    ["\t  ", ""],
    ["\n\n  ", "\n\n"],
    ["\n\n\n", "\n\n\n"],
    ["\n\t  ", "\n"],
  ])("trimLeadingIndentation(%s)", (input, expected) => {
    expect(trimLeadingIndentation(input)).toEqual(expected);
  });
});

describe(trimLaggingNewline, () => {
  it.each([
    ["t", "t"],
    ["  t", "  t"],
    ["   \n", ""],
    ["  \n\n", "\n"],
  ])("trimLaggingNewline(%s)", (input, expected) => {
    expect(trimLaggingNewline(input)).toEqual(expected);
  });
});

describe(trimLeadingIndentationAndNewline, () => {
  it.each([
    ["t", "t"],
    [" t", " t"],
    ["t  ", "t  "],
    ["  ", ""],
    [
      `
       `,
      "",
    ],
    ["\t  ", ""],
    ["\n\n  ", "\n"],
    ["\n\n\n", "\n\n"],
    ["\n\t  ", ""],
    ["\n", ""],
  ])("trimLeadingIndentationAndNewline(%s)", (input, expected) => {
    expect(trimLeadingIndentationAndNewline(input)).toEqual(expected);
  });
});
