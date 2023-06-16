import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import appRootPath from 'app-root-path';
import path from 'path';
import { makeChain } from '$/lib/chain';
import { error } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';

const VECTOR_STORE_DIR = path.join(appRootPath.path, 'data/vector/');

export const POST = async ({ request }) => {
	const body: App.MessageBody = await request.json();
	if (!body) throw error(400, 'Missing Data');
	try {
		console.log('loading vectorstore');
		const vectorstore = await HNSWLib.load(
			VECTOR_STORE_DIR,
			new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY })
		);
		console.log('loaded vectorstore');

		// Create a new readable stream of the chat response
		const readableStream = new ReadableStream({
			async start(controller) {
				try {
					console.log('start');

					console.log('making chain');
					const chain = makeChain(vectorstore, (token: string) => {
						controller.enqueue(token);
					});
					console.log('made chain');

					console.log('calling chain');
					const res = await chain.call({
						query: body.question
					});

					console.log('done calling chain', res);
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

		return new Response(
			JSON.stringify({
				error: 'Oups, an error happened, try again later.',
				ok: false
			}),
			{
				status: 500
			}
		);
	}
};
