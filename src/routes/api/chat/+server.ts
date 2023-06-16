import { loadVectorstore, makeChain } from '$/lib/chain';
import { error, json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	const body: App.MessageBody = await request.json();
	if (!body) throw error(400, 'Missing Data');

	try {
		const query = body.question;

		const vectorstore = await loadVectorstore();
		const chain = makeChain(vectorstore);

		console.log('Answering query:', query);
		const modelResponse = await chain.call({ query });
		const answer = modelResponse.text;

		// console.log('Model response:', {
		// 	modelResponse,
		// 	answer
		// });

		return json({ answer });
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
