import assert from "node:assert/strict";
import test from "node:test";

import { extensionStatus } from "../src/index.js";

test("fixture baseline", () => {
  assert.equal(extensionStatus(), "foundation-only");
});
