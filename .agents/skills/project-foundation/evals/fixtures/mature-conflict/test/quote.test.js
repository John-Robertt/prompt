import assert from "node:assert/strict";
import test from "node:test";

import { quoteShipment } from "../src/quote.js";

test("quotes locally with two decimal places", () => {
  assert.equal(quoteShipment([{ weight: 1.25 }], 1.5), 1.88);
});
