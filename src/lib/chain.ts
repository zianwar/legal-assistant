import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConsoleCallbackHandler } from 'langchain/callbacks';
import { RetrievalQAChain } from 'langchain/chains';
import { OPENAI_API_KEY } from '$env/static/private';
import type { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { PromptTemplate } from 'langchain/prompts';

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

export const makeChain = (vectorstore: HNSWLib, onTokenStream?: (token: string) => void) => {
	const model = new ChatOpenAI({
		temperature: 0,
		openAIApiKey: OPENAI_API_KEY,
		modelName: 'gpt-3.5-turbo',
		streaming: true,
		callbacks: [
			new ConsoleCallbackHandler(),
			{
				handleLLMNewToken(token: string) {
					if (onTokenStream) {
						onTokenStream(token);
					}
				}
			}
		]
	});

	// Create the chain
	// https://js.langchain.com/docs/modules/chains/index_related_chains/retrieval_qa
	return RetrievalQAChain.fromLLM(model, vectorstore.asRetriever(), {
		prompt: QA_PROMPT,
		returnSourceDocuments: true
	});
};
