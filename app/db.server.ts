import { PrismaClient } from "@prisma/client";

let db: PrismaClient;

declare global {
	var __db: PrismaClient | undefined;
}

// 개발 환경에서 핫 리로딩 시 여러 인스턴스가 생성되는 것을 방지
if (process.env.NODE_ENV === "production") {
	db = new PrismaClient();
} else {
	if (!global.__db) {
		global.__db = new PrismaClient();
	}
	db = global.__db;
}

export { db };
