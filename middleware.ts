import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes by role
const protectedRoutes = {
  all: ["/dashboard"],
  admin: ["/dashboard/users", "/dashboard/settings"],
  executive: ["/dashboard/executive"],
};

export async function middleware(req: NextRequest) {
  // const path = req.nextUrl.pathname;
  // // Authentication check
  // if (path.startsWith('/dashboard')) {
  //   const session = await getToken({
  //     req,
  //     secret: process.env.NEXTAUTH_SECRET,
  //   });
  //   // No session means not logged in, redirect to login
  //   if (!session) {
  //     const url = new URL('/login', req.url);
  //     url.searchParams.set('callbackUrl', encodeURI(path));
  //     return NextResponse.redirect(url);
  //   }
  //   // Role-based access control
  //   const userRole = session.role as string;
  //   // Check admin routes
  //   if (
  //     protectedRoutes.admin.some(route => path.startsWith(route)) &&
  //     !['admin', 'executive'].includes(userRole)
  //   ) {
  //     return NextResponse.redirect(new URL('/dashboard', req.url));
  //   }
  //   // Check executive routes
  //   if (
  //     protectedRoutes.executive.some(route => path.startsWith(route)) &&
  //     userRole !== 'executive'
  //   ) {
  //     return NextResponse.redirect(new URL('/dashboard', req.url));
  //   }
  // }
  // return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
