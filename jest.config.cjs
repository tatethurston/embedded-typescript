// eslint-disable-next-line no-undef
module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  modulePathIgnorePatterns: ["dist", "examples"],
  moduleNameMapper: {
    // TS ESM imports are referenced with .js extensions, but jest will fail to find
    // the uncompiled file because it ends with .ts and is looking for .js.
    "(.+)\\.jsx?": "$1",
    // necessary because jest's internal resolver does not follow the same import heuristics as TS
    // .ets.ts should be imported before searching for .ets when importing 'foo.ets' but jest does
    // the reverse order.
    "(.*).ets": "$1.ets.ts",
  },
};
