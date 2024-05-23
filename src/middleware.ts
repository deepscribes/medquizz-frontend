import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/risultati(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req))
    auth().protect({
      unauthorizedUrl: "https://medquizz.it/sign-in",
      unauthenticatedUrl: "https://medquizz.it/sign-in",
    });
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
