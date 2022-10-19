#!/usr/bin/env node
import { run } from "./cli/cli.js";
export type { UserConfig as Config } from "./cli/cli.js";

void run();
