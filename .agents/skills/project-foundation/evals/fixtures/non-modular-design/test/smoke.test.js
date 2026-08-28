import assert from "node:assert/strict";
import test from "node:test";

import { implementationStatus } from "../src/index.js";

test("fixture baseline", () => {
  assert.equal(implementationStatus(), "single-process-prototype");
});
