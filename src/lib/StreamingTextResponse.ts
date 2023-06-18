import type { VectorStore } from 'langchain/vectorstores';
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
				const chain = makeChain(vectorstore, {
					handleLLMNewToken: async (token: string) => {
						controller.enqueue(token);
					},
					handleChainEnd: async () => {
						controller.close();
					},
					handleLLMError: async (e) => {
						controller.error(e);
					}
				});

				console.log('Answering query:', query);
				const response = await chain.call({ query });
				console.log('response', response);
				if (onAnswer) {
					onAnswer(response.text);
				}

				// controller.close();
			} catch (error) {
				console.log('error inside ReadableStream:', error);
				// controller.error(error);
			}
		}
	});

	return new Response(readableStream, {
		headers: { 'Content-Type': 'text/plain' }
	});
};
