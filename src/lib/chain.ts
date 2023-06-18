import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CallbackManager } from 'langchain/callbacks';
import type { CallbackHandlerMethods } from 'langchain/callbacks';
import { RetrievalQAChain } from 'langchain/chains';
import { env } from '$env/dynamic/private';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { QA_PROMPT_V3 } from './prompts.templates';
import { VECTOR_STORE_DIR } from './constants';
import type { VectorStore } from 'langchain/vectorstores';

export const loadVectorstore = () => {
	const vectorstore = HNSWLib.load(
		VECTOR_STORE_DIR,
		new OpenAIEmbeddings({ openAIApiKey: env.OPENAI_API_KEY })
	);
	console.log('loaded vectorstore');
	return vectorstore;
};

export const makeChain = (vectorstore: VectorStore, handlers: CallbackHandlerMethods) => {
	// const extraCallbacks = [];
	// if (env.DEBUG) {
	// 	console.log('Adding debug console callback');
	// 	extraCallbacks.push(new ConsoleCallbackHandler());
	// }

	const model = new ChatOpenAI({
		temperature: 0,
		openAIApiKey: env.OPENAI_API_KEY,
		modelName: 'gpt-3.5-turbo',
		streaming: true,
		callbacks: CallbackManager.fromHandlers(handlers)
	});

	// Create the chain
	// https://js.langchain.com/docs/modules/chains/index_related_chains/retrieval_qa
	const chain = RetrievalQAChain.fromLLM(model, vectorstore.asRetriever(), {
		prompt: QA_PROMPT_V3,
		returnSourceDocuments: true
	});
	console.log('Created chain');

	return chain;
};
