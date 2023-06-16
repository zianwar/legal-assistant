import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConsoleCallbackHandler } from 'langchain/callbacks';
import { RetrievalQAChain } from 'langchain/chains';
import { env } from '$env/dynamic/private';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import appRootPath from 'app-root-path';
import path from 'path';

export const VECTOR_STORE_DIR = env.DATA_DIR
	? path.join(env.DATA_DIR, 'vector')
	: path.join(appRootPath.path, 'data', 'vector');
export const DOCUMENTS_DIR = env.DATA_DIR
	? path.join(env.DATA_DIR, 'documents')
	: path.join(appRootPath.path, 'data', 'documents');

const CONDENSE_PROMPT =
	PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT = PromptTemplate.fromTemplate(
	`You are an AI assistant for the Revised Code of Washington (RCW). The official law text is is located at https://app.leg.wa.gov/RCW/.
You are given the following extracted parts of a long document and a question. Provide an answer with a hyperlink to the law text.
You should only use hyperlinks that are explicitly listed as a source in the context. Do NOT make up a hyperlink that is not listed.
If the question includes a request for a sources, provide a text directly from the law text.
If you don't know the answer, just say "Hmm, I'm not sure." Don't try to make up an answer.
If the question is not about LangChain, politely inform them that you are tuned to only answer questions about LangChain.
Question: {question}
=========
{context}
=========
Answer in Markdown:`
);

export const makeChain = (vectorstore: HNSWLib) => {
	const model = new ChatOpenAI({
		temperature: 0,
		openAIApiKey: env.OPENAI_API_KEY,
		modelName: 'gpt-3.5-turbo',
		streaming: false
		// callbacks: [new ConsoleCallbackHandler()]
	});

	// Create the chain
	// https://js.langchain.com/docs/modules/chains/index_related_chains/retrieval_qa
	const chain = RetrievalQAChain.fromLLM(model, vectorstore.asRetriever(), {
		prompt: QA_PROMPT,
		returnSourceDocuments: true
	});
	console.log('Created chain');

	return chain;
};

export const loadVectorstore = () => {
	const vectorstore = HNSWLib.load(
		VECTOR_STORE_DIR,
		new OpenAIEmbeddings({ openAIApiKey: env.OPENAI_API_KEY })
	);
	console.log('loaded vectorstore');
	return vectorstore;
};
