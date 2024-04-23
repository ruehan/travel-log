import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
	id?: number;
}

export default function getSession() {
	return getIronSession<SessionContent>(cookies(), {
		cookieName: "travel-log",
		password: process.env.COOKIE_PASSWORD!,
		cookieOptions: {
			secure: false,
		},
	});
}
