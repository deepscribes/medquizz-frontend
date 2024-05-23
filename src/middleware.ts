import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/risultati(.*)"]);

function getRedirectUrl() {
  if (process.env.VERCEL_ENV === "development") {
    return "http://localhost:3000/sign-in";
  }
  if (process.env.VERCEL_ENV === "preview") {
    return "https://medquizz-frontend-git-feature-deepscribes.vercel.app/sign-in";
  }
  return "https://medquizz.it/sign-in";
}

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req))
    auth().protect({
      unauthorizedUrl: getRedirectUrl(),
      unauthenticatedUrl: getRedirectUrl(),
    });
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
