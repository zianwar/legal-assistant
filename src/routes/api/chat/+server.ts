import { loadVectorstore } from '$/lib/chain';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import db from '$lib/database';
import { GENERIC_ERROR, VECTOR_STORE_DIR } from '$/lib/constants.js';
import { StreamingTextResponse } from '$/lib/StreamingTextResponse';

export const POST = async ({ request }) => {
	const body: App.MessageBody = await request.json();
	if (!body) throw error(400, 'Missing Data');

	try {
		const question = body.question;
		const vectorstore = await loadVectorstore(VECTOR_STORE_DIR, env.OPENAI_API_KEY);
		return StreamingTextResponse(question, vectorstore, async (answer: string) => {
			await saveQA(question, answer);
		});
	} catch (error) {
		console.error(error);
		return json({ error: GENERIC_ERROR }, { status: 500 });
	}
};

const saveQA = async (question: string, answer: string) => {
	try {
		await db.qA.create({ data: { question, answer } });
	} catch (error) {
		console.log('Failed to save QA', error);
	}
};
