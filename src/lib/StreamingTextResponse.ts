import type { VectorStore } from 'langchain/vectorstores';
import { env } from '$env/dynamic/private';
import { makeChain } from './chain';

export const StreamingTextResponse = (
	query: string,
	vectorstore: VectorStore,
	onAnswer?: (s: string) => void
) => {
	// Create a new readable stream of the chat response
	const readableStream = new ReadableStream({
		async start(controller) {
			try {
				const chain = makeChain(vectorstore, env.OPENAI_API_KEY, {
					handleLLMNewToken: async (token: string) => {
						controller.enqueue(token);
					}
				});

				console.log('Answering query:', query);
				const response = await chain.call({ query });

				if (onAnswer) {
					onAnswer(response.text);
				}

				controller.close();
			} catch (error) {
				console.log('error inside ReadableStream:', error);
				controller.error(error);
			}
		}
	});

	return new Response(readableStream, {
		headers: { 'Content-Type': 'text/plain' }
	});
};
