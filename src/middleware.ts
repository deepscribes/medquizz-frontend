import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/risultati(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req))
    auth().protect({
      unauthorizedUrl: "http://localhost:3000/sign-in",
      unauthenticatedUrl: "http://localhost:3000/sign-in",
    });
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
