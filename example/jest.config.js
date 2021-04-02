module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  // necessary because jest's internal resolver does not follow the same import heuristics as TS
  // .ets.ts should be imported before searching for .ets when importing 'foo.ets' but jest does
  // the reverse order.
  moduleNameMapper: {
    "(.*).ets": "$1.ets.ts",
  },
};
