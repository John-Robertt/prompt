import assert from "node:assert/strict";
import test from "node:test";

import { ingest } from "../src/index.js";

test("v1 returns string rows", () => {
  assert.deepEqual(ingest("a\nb"), ["a", "b"]);
});
