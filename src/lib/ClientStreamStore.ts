import { writable } from 'svelte/store';

export function ClientStreamStore() {
	const { subscribe, set, update } = writable({ loading: false, text: '' });

	async function request(request: Request) {
		set({ loading: true, text: '' });

		try {
			const result = await fetch(request);

			if (!result.ok) throw new Error(result.statusText);
			if (!result.body) return;

			const reader = result.body.pipeThrough(new TextDecoderStream()).getReader();
			let finalText = '';

			// eslint-disable-next-line no-constant-condition
			while (true) {
				const { value: token, done } = await reader.read();

				if (token != undefined) {
					update((val) => {
						finalText = val.text + token;
						return { loading: true, text: finalText };
					});
				}
				if (done) {
					break;
				}
			}

			set({ loading: false, text: '' });

			return finalText;
		} catch (err) {
			set({ loading: false, text: `${err}` });
			throw err;
		}
	}

	return { subscribe, request };
}
