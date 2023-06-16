import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import appRootPath from 'app-root-path';
import path from 'path';
import { makeChain } from './pages/api/chain';
import 'dotenv/config';

// Constants
const VECTOR_STORE_DIR = path.join(appRootPath.path, 'data/vector/');

export const run = async () => {
	try {
		const vectorstore = await HNSWLib.load(
			VECTOR_STORE_DIR,
			new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY })
		);
		const chain = makeChain(vectorstore, (token: string) => {});

		const res = await chain.call({
			query: 'Are there any other duties not mentioned here?'
		});

		console.log('Answer:', { res });

		return res;
	} catch (err) {
		console.error(err);
	} finally {
		console.log('[DONE]');
	}
};

(async () => {
	await run();
	console.log('done');
})();
