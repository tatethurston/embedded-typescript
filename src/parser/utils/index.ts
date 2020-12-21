export function isPresent(idx: number): boolean {
  return idx !== -1;
}

export function isWhitespace(token: string): boolean {
  return token.replace(/\s+/g, "").length === 0;
}

type NetBlockState = "open" | "close" | "balanced";

type BlockTracker = {
  blocks: string[];
  digest(input: string): NetBlockState;
  isOpen(): boolean;
};

const PAIRS: Record<string, string> = {
  "}": "{",
  "]": "[",
  ")": "(",
};
const OPEN_TOKENS = Object.values(PAIRS);
const CLOSE_TOKENS = Object.keys(PAIRS);

export function blockTracker(): BlockTracker {
  const blocks: string[] = [];

  function digest(input: string): NetBlockState {
    let change = 0;
    input.split("").forEach((token) => {
      if (OPEN_TOKENS.includes(token)) {
        change += 1;
        blocks.push(token);
      }

      if (CLOSE_TOKENS.includes(token)) {
        const last = blocks.pop();
        change -= 1;
        if (!last) {
          throw new Error(`Unexpected '${token}'`);
        }
        if (PAIRS[token] !== last) {
          throw new Error(`Expected '${last}' but found '${token}'`);
        }
      }
    });

    if (change > 0) {
      return "open";
    }
    if (change < 0) {
      return "close";
    }
    return "balanced";
  }

  function isOpen() {
    return blocks.length > 0;
  }

  return {
    blocks,
    digest,
    isOpen,
  };
}
