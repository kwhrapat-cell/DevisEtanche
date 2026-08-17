import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PAGES_PROTEGEES = ["/dashboard", "/chantiers", "/devis", "/clients", "/calculateur", "/parametres", "/catalogue"];

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
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
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

  // Compte authentifié mais sans profil (entreprise jamais créée, ex. inscription
  // antérieure au correctif RLS) : redirige vers la page de complétion plutôt que
  // de laisser chaque page échouer silencieusement faute d'entreprise_id.
  if (cheminProtege && user) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/completer-profil";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chantiers/:path*",
    "/devis/:path*",
    "/clients/:path*",
    "/calculateur/:path*",
    "/parametres/:path*",
    "/catalogue/:path*",
  ],
};
