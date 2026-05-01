import test from "node:test";
import assert from "node:assert/strict";

import { getFitZoom } from "./imageCropperSizing.mjs";

test("returns 1 when the image already matches the crop aspect", () => {
  assert.equal(getFitZoom({ width: 1000, height: 1000 }, 1), 1);
});

test("returns a lower zoom that fits a wide image inside a square logo crop", () => {
  assert.equal(getFitZoom({ width: 2000, height: 1000 }, 1), 0.5);
});

test("returns a lower zoom that fits a tall image inside a poster crop", () => {
  assert.equal(getFitZoom({ width: 1000, height: 2000 }, 595 / 842), 0.70756);
});

test("falls back to 1 for invalid dimensions", () => {
  assert.equal(getFitZoom({ width: 0, height: 1000 }, 1), 1);
  assert.equal(getFitZoom({ width: 1000, height: 1000 }, 0), 1);
});
