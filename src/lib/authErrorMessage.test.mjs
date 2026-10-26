import test from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage } from "./authErrorMessage.mjs";

test("popup cancellation is quiet and the user can try another provider", () => {
  assert.equal(authErrorMessage({ code: "auth/popup-closed-by-user" }), null);
  assert.equal(authErrorMessage({ code: "auth/cancelled-popup-request" }), null);
});

test("account conflicts guide the user back to their existing sign-in method", () => {
  assert.match(authErrorMessage({ code: "auth/account-exists-with-different-credential" }), /original sign-in method/);
});

test("popup, network and setup failures give actionable messages", () => {
  assert.match(authErrorMessage({ code: "auth/popup-blocked" }), /Allow popups/);
  assert.match(authErrorMessage({ code: "auth/network-request-failed" }), /connection/);
  assert.match(authErrorMessage({ code: "auth/operation-not-allowed" }), /administrator/);
  assert.match(authErrorMessage({ code: "auth/unauthorized-domain" }), /administrator/);
});

test("unknown errors do not expose raw Firebase or backend details", () => {
  assert.equal(authErrorMessage(new Error("internal details")), "We couldn't sign you in. Please try again.");
});
