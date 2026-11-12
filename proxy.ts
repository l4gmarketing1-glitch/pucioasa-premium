import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "node:crypto";
import { adminConfigurationIssues } from "@/lib/configuration.mjs";
export function proxy(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USER || "admin";
  const issues = adminConfigurationIssues(process.env);
  if (issues.length)
    return new NextResponse(
      "Administrarea nu este configurată. " +
        issues[0].message +
        " Verifică /diagnostic pentru detalii.",
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  const expected =
    "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
  const actual = req.headers.get("authorization") || "";
  const digest = (s: string) => createHash("sha256").update(s).digest();
  if (!timingSafeEqual(digest(actual), digest(expected)))
    return new NextResponse("Autentificare necesară.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Pucioasa Premium", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
export const config = { matcher: ["/admin/:path*"] };
