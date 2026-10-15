export function authErrorMessage(error) {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/popup-blocked":
      return "Allow popups for this site, then try signing in again.";
    case "auth/account-exists-with-different-credential":
      return "This email already uses another provider. Please use your original sign-in method.";
    case "auth/network-request-failed":
      return "Check your internet connection, then try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't available yet. Try the other option or contact your administrator.";
    case "auth/unauthorized-domain":
      return "Sign-in isn't configured for this website. Please contact your administrator.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact your administrator.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Please wait a moment and try again.";
    default:
      return "We couldn't sign you in. Please try again.";
  }
}
