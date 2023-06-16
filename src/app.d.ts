// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface MessageBody {
			question: string;
		}
		interface ChatResponse {
			answer: string;
			error: string?;
		}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
