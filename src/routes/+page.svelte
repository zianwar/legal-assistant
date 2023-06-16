<script lang="ts">
	import { readableStreamStore } from '$/lib/readableStreamStore';
	import { fly } from 'svelte/transition';
	import Typingindicator from '$lib/typingindicator.svelte';

	let answer = '';
	let answerHtml: string | null = null;
	const response = readableStreamStore();

	async function handleSubmit(this: HTMLFormElement) {
		if ($response.loading) return;
		const formData: FormData = new FormData(this);
		const question = formData.get('question') as string;

		if (question == '') return;

		try {
			console.log('sending request to /api/chat');

			const resp = response.request(
				new Request('/api/chat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ question })
				})
			);

			// this.reset();
			answer = (await resp) as string;
			console.log('received answer:', answer);
		} catch (err) {
			answer = `Error: ${err}`;
		}
	}

	const markdownToHtml = (str: string) => {
		return str.replaceAll('\n', '<br/>');
	};
</script>

<main class="lg:max-w-7xl px-8 mx-auto">
	<div class="flex flex-col space-y-1 pb-8">
		<h1 class="text-3xl font-bold">Legal Assistant!</h1>
		<p class="">Ask me any question about <b>Revised Code of Washington (RCW)</b>.</p>
		<!-- <pre class="border p-4"><code>{JSON.stringify({ answer, response: $response }, null, 2)}</code></pre> -->
	</div>

	<div class="flex flex-col space-y-6 lg:space-y-0 lg:space-x-6 lg:flex-row">
		<aside class="">
			<form
				class="flex flex-col space-y-4 md:min-w-[28rem] lg:min-w-[32rem] xl:min-w-[36rem] max-w-6xl"
				on:submit|preventDefault={handleSubmit}
				method="POST"
				action="/api/chat"
			>
				<span class="">
					<textarea
						rows="4"
						placeholder="Type your question..."
						name="question"
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
					/>
					<div class="mt-2 flex justify-start">
						<button
							type="submit"
							class="block rounded-md border border-transparent bg-neutral-800 px-8 py-2 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
						>
							Send
						</button>
					</div>
				</span>
			</form>
		</aside>

		<aside class="text-zinc-800 rounded-lg">
			{#if $response.text !== ''}
				{markdownToHtml($response.text)}
			{:else if $response.loading}
				<div in:fly={{ y: 50, duration: 600 }}>
					<Typingindicator />
				</div>
			{:else}
				{markdownToHtml(answer)}
			{/if}
		</aside>
	</div>
</main>
