import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SourceTextModule, SyntheticModule } from "node:vm";

test("Google popup uses the shared Firebase auth and returns a Firebase ID token", async () => {
  const auth = { name: "shared-auth" };
  const user = { getIdToken: async () => "firebase-id-token" };
  let parameters;
  class GoogleAuthProvider {
    setCustomParameters(value) { parameters = value; }
  }
  const firebase = new SyntheticModule(["GoogleAuthProvider", "signInWithPopup"], function () {
    this.setExport("GoogleAuthProvider", GoogleAuthProvider);
    this.setExport("signInWithPopup", async (receivedAuth, provider) => {
      assert.equal(receivedAuth, auth);
      assert.ok(provider instanceof GoogleAuthProvider);
      return { user };
    });
  });
  const config = new SyntheticModule(["auth"], function () { this.setExport("auth", auth); });
  const source = await readFile(new URL("./authGoogle.js", import.meta.url), "utf8");
  const authModule = new SourceTextModule(source);
  await authModule.link((specifier) => specifier === "firebase/auth" ? firebase : config);
  await authModule.evaluate();
  const result = await authModule.namespace.signInWithGoogle();
  assert.equal(result.user, user);
  assert.equal(result.idToken, "firebase-id-token");
  assert.equal(parameters.prompt, "select_account");
});
