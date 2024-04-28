import getSession from "@/app/lib/session";
import { NextRequest, NextResponse } from "next/server";

interface Routes {
	[key: string]: boolean;
}

const publicOnlyUrls: Routes = {
	"/log-in": true,
	"/create-account": true,
	"/": true,
};

export async function middleware(request: NextRequest) {
	const session = await getSession();
	const exists = publicOnlyUrls[request.nextUrl.pathname];
	if (!session.id) {
		if (!exists) {
			return NextResponse.redirect(new URL("/create-account", request.url));
		}
	} else {
		if (exists) {
			return NextResponse.redirect(new URL("/home", request.url));
		}
	}
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
