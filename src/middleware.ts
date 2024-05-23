import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/risultati(.*)"]);

function getRedirectUrl() {
  console.log(process.env.VERCEL_ENV);
  if (process.env.VERCEL_ENV === "development") {
    return "http://localhost:3000/sign-up";
  }
  if (process.env.VERCEL_ENV === "preview") {
    return "https://medquizz-frontend-git-feature-deepscribes.vercel.app/sign-up";
  }
  return "https://medquizz.it/sign-up";
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
