import { isPresent, isWhitespace, blockTracker } from ".";

describe(isPresent, () => {
  it.each([
    [-1, false],
    [0, true],
    [1, true],
  ])("isPresent(%i)", (idx, expected) => {
    expect(isPresent(idx)).toEqual(expected);
  });
});

describe(isWhitespace, () => {
  it.each([
    ["t", false],
    [" t", false],
    ["", true],
    [" ", true],
    ["\n", true],
    ["\t", true],
  ])("isWhitespace(%s)", (input, expected) => {
    expect(isWhitespace(input)).toEqual(expected);
  });
});

describe(blockTracker, () => {
  describe(".digest", () => {
    describe("balanced", () => {
      it.each([
        "",
        "[1,2,3].map(function(x) { return x + 1 })",
        "import { foo } from './foo'",
        "[()]{}{[()()]()}",
        "[{()()}({[]})]({}[({})])((((((()[])){}))[]{{{({({({{{{{{}}}}}})})})}}}))[][][]",
      ])(".digest(%s)", (input) => {
        const tracker = blockTracker();
        expect(tracker.digest(input)).toEqual("balanced");
      });
    });

    describe("open", () => {
      it.each([
        "if (x === 'ok') {",
        "users.forEach((x) => {",
        "[1,2,3].map(function(x) {",
      ])(".digest(%s)", (input) => {
        const tracker = blockTracker();
        expect(tracker.digest(input)).toEqual("open");
      });
    });

    describe("close", () => {
      it.each([
        ["}", "{"],
        ["})", "({"],
      ])(".digest(%s)", (input, initialState) => {
        const tracker = blockTracker();
        tracker.digest(initialState);
        expect(tracker.digest(input)).toEqual("close");
      });
    });
  });
});
