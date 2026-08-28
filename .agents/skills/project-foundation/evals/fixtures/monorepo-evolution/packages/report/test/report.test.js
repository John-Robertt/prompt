import assert from "node:assert/strict";
import test from "node:test";

import { report } from "../src/index.js";

test("v1 reports string rows", () => {
  assert.equal(report(["a", "b"]), "a | b");
});
