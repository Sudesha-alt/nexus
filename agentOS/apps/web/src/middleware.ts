import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isApp =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/departments") ||
    req.nextUrl.pathname.startsWith("/agents") ||
    req.nextUrl.pathname.startsWith("/tasks") ||
    req.nextUrl.pathname.startsWith("/skills");

  if (isApp && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }
  if (
    isLoggedIn &&
    (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")
  ) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
  return undefined;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/departments",
    "/departments/:path*",
    "/agents/:path*",
    "/tasks/:path*",
    "/skills/:path*",
    "/login",
    "/register",
  ],
};
