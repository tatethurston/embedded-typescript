import { isPresent } from ".";

describe(isPresent, () => {
  it.each([
    [-1, false],
    [0, true],
    [1, true],
  ])("isPresent(%i)", (idx, expected) => {
    expect(isPresent(idx)).toEqual(expected);
  });
});
