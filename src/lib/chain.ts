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

const QA_PROMPT_V1 =
	PromptTemplate.fromTemplate(`You are an AI assistant for the Revised Code of Washington (RCW). The official law website is https://app.leg.wa.gov/RCW/. Use the following pieces of context to create a final answer with references ("SOURCES"). If you don't know the answer, say that you don't know, don't try to make up an answer. ALWAYS return a "SOURCES" part in your answer.

This should be in the following format:

Question: [question here]
Answer: [answer here]

Begin!

Context:
---------
{context}
---------
Question: {question}
Answer:`);

const QA_PROMPT_V2 = PromptTemplate.fromTemplate(
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

const QA_PROMPT_V3 = PromptTemplate.fromTemplate(`
Given the following extracted parts of a long document and a question, create a final answer with references ("Sources").
If you don't know the answer, just say that you don't know. Don't try to make up an answer. You should only use hyperlinks that are explicitly listed as a source in the context.
ALWAYS return a list of "Sources" part in your answer formatted as list.

Question: {question}
=========
{context}
=========
FINAL ANSWER in Markdown:`);

export const makeChain = (vectorstore: HNSWLib, onTokenStream?: (token: string) => void) => {
	const extraCallbacks = [];
	if (env.DEBUG) {
		console.log('Adding debug console callback');
		extraCallbacks.push(new ConsoleCallbackHandler());
	}

	const model = new ChatOpenAI({
		temperature: 0,
		openAIApiKey: env.OPENAI_API_KEY,
		modelName: 'gpt-3.5-turbo',
		streaming: true,
		callbacks: [
			{
				handleLLMNewToken(token: string) {
					if (onTokenStream) {
						onTokenStream(token);
					}
				}
			},
			...extraCallbacks
		]
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

export const loadVectorstore = () => {
	const vectorstore = HNSWLib.load(
		VECTOR_STORE_DIR,
		new OpenAIEmbeddings({ openAIApiKey: env.OPENAI_API_KEY })
	);
	console.log('loaded vectorstore');
	return vectorstore;
};
