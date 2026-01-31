/**
 * Maps Supabase auth errors to user-friendly messages.
 * Handles rate limits, invalid credentials, and common auth issues.
 */
export function getAuthErrorMessage(error: Error): string {
  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("rate limit") || message.includes("email rate limit")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (message.includes("invalid login credentials") || message.includes("invalid_credentials")) {
    return "Invalid email or password. Please try again.";
  }
  if (message.includes("email not confirmed")) {
    return "Please confirm your email address. Check your inbox for the verification link.";
  }
  if (message.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (message.includes("password")) {
    return "Password must be at least 6 characters.";
  }
  if (message.includes("oauth") || message.includes("provider")) {
    return "OAuth sign-in was cancelled or failed. Please try again.";
  }

  return error.message || "An error occurred. Please try again.";
}
