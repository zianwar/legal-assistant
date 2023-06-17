import { loadVectorstore, makeChain } from '$/lib/chain';
import { error, json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	const body: App.MessageBody = await request.json();
	if (!body) throw error(400, 'Missing Data');

	try {
		const query = body.question;
		const vectorstore = await loadVectorstore();

		// Create a new readable stream of the chat response
		const readableStream = new ReadableStream({
			async start(controller) {
				try {
					const chain = makeChain(vectorstore, (token: string) => {
						controller.enqueue(token);
					});

					console.log('Answering query:', query);
					await chain.call({ query });
					controller.close();
				} catch (error) {
					console.log('error inside ReadableStream:', error);
					controller.error(error);
				}
			}
		});

		// Create and return a response of the readable stream
		return new Response(readableStream, {
			headers: { 'Content-Type': 'text/plain' }
		});
	} catch (error) {
		console.error(error);
		return json(
			{
				error: 'Oups, an error happened, try again later.'
			},
			{ status: 500 }
		);
	}
};
