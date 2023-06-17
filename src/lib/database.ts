import pkg, { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

declare global {
	// eslint-disable-next-line no-var
	var _prisma: PrismaClient;
}

let prisma;

if (dev) {
	if (!global._prisma) {
		global._prisma = new PrismaClient();
	}

	prisma = global._prisma;
} else {
	const { PrismaClient: PrismaClientProd } = pkg;
	prisma = new PrismaClientProd();
}

export default prisma as PrismaClient;
