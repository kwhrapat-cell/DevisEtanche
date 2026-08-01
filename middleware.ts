import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PAGES_PROTEGEES = ["/dashboard", "/chantiers", "/devis", "/clients", "/calculateur", "/parametres"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cheminProtege = PAGES_PROTEGEES.some((p) => request.nextUrl.pathname.startsWith(p));

  if (cheminProtege && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("suivant", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/chantiers/:path*", "/devis/:path*", "/clients/:path*", "/calculateur/:path*", "/parametres/:path*"],
};
