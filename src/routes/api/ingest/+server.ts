import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { MarkdownTextSplitter } from 'langchain/text_splitter';
import type { Document } from 'langchain/document';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import fs from 'fs-extra';
import path from 'path';
import { DOCUMENTS_DIR, VECTOR_STORE_DIR } from '$/lib/constants';

// Constants
const TEXT_SPLITTER_CHUNK_SIZE = 1500;

console.log({ VECTOR_STORE_DIR, DOCUMENTS_DIR, NODE_OPTIONS: env.NODE_OPTIONS });

// Ensure data dirs exist
fs.ensureDirSync(DOCUMENTS_DIR);
fs.ensureDirSync(VECTOR_STORE_DIR);

export const GET = async ({ url }) => {
	try {
		const key = String(url.searchParams.get('key'));
		if (key !== env.INGEST_KEY) {
			return json({ success: false, error: 'Invalid ingest key' }, { status: 400 });
		}

		console.log(`Loading documents from ${DOCUMENTS_DIR}`);

		// Load all .md files within the specified directory we want to do question answering over
		const recursive = true;
		const directoryLoader = new DirectoryLoader(
			DOCUMENTS_DIR,
			{
				'.md': (path: string) => new TextLoader(path)
			},
			recursive
		);
		const docs = await directoryLoader.load();
		console.log(`Loaded ${docs.length} documents`);

		// formatDocumentSources(docs);
		if (!docs || !docs.length) {
			return json({ error: 'Missing docs', success: false });
		}

		// Split the text into chunks
		console.log('Splitting documents into chunks');
		const textSplitter = new MarkdownTextSplitter({ chunkSize: TEXT_SPLITTER_CHUNK_SIZE });
		const chunkedDocs = await textSplitter.splitDocuments(docs);

		// Create the vectorstore
		console.log('Creating vector store records from documents');
		const vectorStore = await HNSWLib.fromDocuments(
			chunkedDocs,
			new OpenAIEmbeddings({ openAIApiKey: env.OPENAI_API_KEY })
		);

		console.log('Created vectorstore');

		// Save the vector store to a directory
		console.log(VECTOR_STORE_DIR);

		await vectorStore.save(VECTOR_STORE_DIR);

		return json({ success: true, error: null });
	} catch (error) {
		console.log(error);
		return json({ error: error }, { status: 500 });
	}
};

// ------------ Utilities ------------

function formatDocumentSources(docs: Document<Record<string, unknown>>[]) {
	const getFormattedSource = (doc: Document<Record<string, unknown>>) => {
		// Turn the following:
		// 	35_cities_and_towns/35.107_commercial_office_space_development.md
		// into:
		// 	Title 35 RCW: CITIES AND TOWNS - Chapter 35.107 RCW: COMMERCIAL OFFICE SPACE DEVELOPMENT
		let source = doc.metadata['source'] as string;
		if (!source || String(source || '').trim() == '') {
			console.log('Error: empty or missing source for document:', doc);
			return null;
		}

		source = source.replace(DOCUMENTS_DIR, '').replace(/_/g, ' ').toUpperCase();
		const pathParts = source.split(path.sep).filter((s) => s);
		if (pathParts.length !== 2) {
			console.log('Error: source path does not contains 2 items:', pathParts);
			return null;
		}

		let titleName = pathParts[0];
		let chapterName = path.parse(pathParts[1]).name;
		const titleNumber = titleName.match(/\d+(\w+)?\.?\w*/)?.[0];
		if (!titleNumber) {
			console.log('Error: cannot extract title number from source', { titleName });
			return null;
		}

		titleName = titleName.replace(titleNumber, '').trim();
		if (chapterName.toLowerCase().startsWith('readme')) {
			return `TITLE ${titleNumber} - {titleName}`;
		}

		const chapterNumber = chapterName.match(/\d+(\w+)?\.?\w*/)?.[0];
		if (!chapterNumber) {
			console.log('Error: cannot extract chapter number from source', { chapterName });
			return;
		}

		chapterName = chapterName.replace(chapterNumber, '').trim();
		return `TITLE ${titleNumber}: ${titleName} - CHAPTER ${chapterNumber}: ${chapterName}`;
	};

	for (let i = 0; i < docs.length; i++) {
		const doc = docs[i];
		const source = getFormattedSource(doc);
		doc.metadata['source'] = source ?? doc.metadata['source'];
	}
}
