import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;

  const cookieStore = await cookies();
  const { pathname } = request.nextUrl;

  // Allow access to login page and public assets without token
  const publicRoutes = ['', '/too-many-requests'];
  const isPublicRoute = publicRoutes.some((path) => pathname.startsWith(path));

  // If accessing a public route, allow through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    const url = request.nextUrl.clone();
    cookieStore.getAll().forEach((cookie) => {
      cookieStore.delete(cookie.name);
    });
    url.pathname = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|lottie|template).*)',
  ],
};