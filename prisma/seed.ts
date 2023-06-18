import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	// const user = await prisma.user.create({
	// 	data: {
	// 		email: 'anwa1ar.ziani@gmail.com',
	// 		name: 'Anwar'
	// 	}
	// });
	// console.log({ user });
	// const query = await prisma.qA.create({
	// 	data: {
	// 		question: 'What the responsibility of city council?',
	// 		answer: 'None!'
	// 	}
	// });
	// console.log({ query });
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
