<script lang="ts">
	import { fly } from 'svelte/transition';
	import Typingindicator from '$lib/typingindicator.svelte';
	import clsx from 'clsx';
	import linkify from '$/lib/linkify';
	const GENERIC_ERROR = 'An error happened, please try again later.';

	let answer = '';
	let isLoading = false;

	async function handleSubmit(this: HTMLFormElement) {
		const formData: FormData = new FormData(this);
		const question = formData.get('question') as string;

		if (question == '') return;

		try {
			isLoading = true;
			console.log('sending request to /api/chat');
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question })
			});

			const responseJson: App.ChatResponse = await response.json();
			if (responseJson.error) {
				console.log('Server returned error:', responseJson);
				answer = responseJson.error || GENERIC_ERROR;
			} else if (!responseJson || !responseJson.answer || responseJson.answer === '') {
				console.log('Server returned empty response:', responseJson);
				answer = GENERIC_ERROR;
			} else {
				answer = markdownToHtml(responseJson.answer || '');
				console.log('Server returned answer:', { answer });
			}
		} catch (err) {
			answer = `Error: ${err}`;
		} finally {
			isLoading = false;
		}
	}

	const markdownToHtml = (str: string) => {
		return linkify(
			str.replaceAll('\n', '<br/>').replace(/\[([^\]]+)\]\(([^\)]+)\)/, '<a href="$2">$1</a>')
		);
	};
</script>

<main class="max-w-4xl px-8 mx-auto">
	<div class="flex flex-col space-y-2 pb-8">
		<h1 class="text-3xl font-black tracking-wide">Legal Assistant.</h1>
		<p class="">Ask me any question about <b>Revised Code of Washington (RCW)</b>.</p>
	</div>

	<div class="flex flex-col space-y-6">
		<aside class="">
			<form
				class="flex flex-col space-y-4 md:min-w-[28rem] lg:min-w-[32rem] xl:min-w-[36rem] max-w-6xl"
				on:submit|preventDefault={handleSubmit}
				method="POST"
				action="/api/chat"
			>
				<div class="flex align-center py-2 space-x-2">
					<input
						type="text"
						placeholder="Type your question..."
						name="question"
						class="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
					/>
					<button
						disabled={isLoading}
						type="submit"
						class={clsx(
							'block rounded-md border border-transparent px-8 py-2 text-sm font-medium text-white shadow-sm  focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
							isLoading ? 'bg-neutral-400 cursor-wait' : 'bg-neutral-800 hover:bg-black'
						)}
					>
						{isLoading ? 'Loading...' : 'Send'}
					</button>
				</div>
			</form>
		</aside>

		<aside class="text-zinc-800">
			{#await new Promise((res) => setTimeout(res, 1000)) then _}
				{#if isLoading}
					<div in:fly={{ y: 50, duration: 800 }}>
						<Typingindicator />
					</div>
				{:else if answer.trim() !== ''}
					<div in:fly={{ y: 50, duration: 800 }}>
						{@html answer}
					</div>
				{/if}
			{/await}
		</aside>
	</div>
</main>
