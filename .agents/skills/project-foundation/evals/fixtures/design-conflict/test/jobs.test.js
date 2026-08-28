import assert from "node:assert/strict";
import test from "node:test";

import { runJob } from "../src/jobs.js";

test("current implementation runs synchronously", () => {
  assert.equal(runJob(() => "done"), "done");
});
