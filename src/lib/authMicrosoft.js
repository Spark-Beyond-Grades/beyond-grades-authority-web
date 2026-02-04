import { OAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

export async function signInWithMicrosoft() {
  const provider = new OAuthProvider("microsoft.com");
  // Optional: provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken(); // used later in 0.9
  return { user: result.user, idToken };
}