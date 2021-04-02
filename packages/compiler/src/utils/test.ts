import { sanitizeString, trimLeading, trimLagging } from ".";

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

describe(trimLeading, () => {
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
  ])("trimLeading(%s)", (input, expected) => {
    expect(trimLeading(input)).toEqual(expected);
  });
});

describe(trimLagging, () => {
  it.each([
    ["t", "t"],
    ["  t", "  t"],
    ["   \n", ""],
    ["  \n\n", "\n"],
  ])("trimLagging(%s)", (input, expected) => {
    expect(trimLagging(input)).toEqual(expected);
  });
});
