import { ChatOpenAI } from 'langchain/chat_models/openai';
import { CallbackManager } from 'langchain/callbacks';
import type { CallbackHandlerMethods } from 'langchain/callbacks';
import { RetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { QA_PROMPT_V3 } from './prompts.templates';
import type { VectorStore } from 'langchain/vectorstores';

export const loadVectorstore = (vectorStoreDir: string, openAIApiKey: string) => {
	const vectorstore = HNSWLib.load(vectorStoreDir, new OpenAIEmbeddings({ openAIApiKey }));
	console.log('loaded vectorstore');
	return vectorstore;
};

export const makeChain = (
	vectorstore: VectorStore,
	openAiKey: string,
	handlers: CallbackHandlerMethods
) => {
	const model = new ChatOpenAI({
		temperature: 0,
		openAIApiKey: openAiKey,
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
