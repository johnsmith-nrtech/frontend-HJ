import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware() {
  // Get the path from the request URL
  // const path = request.nextUrl.pathname;

  // The auth routes are handled by the route group with its own layout
  // We don't need to do anything special for auth routes
  // But we can add additional redirects if needed

  // Profile page and other protected routes can be handled here
  // For example, if a user is not authenticated, redirect to login

  // const token = request.cookies.get('authToken')?.value;
  //
  // // If trying to access a protected route without authentication
  // if (path === '/profile' && !token) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Apply this middleware to these paths
    "/profile",
    // You can exclude paths from middleware
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
