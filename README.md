# legal-assistant

This is a legal assistant specialized in [Revised Code of Washington (RCW)](https://apps.leg.wa.gov/rcw/) law, you can ask any question and it will respond based on law text.

![](https://pub.anw.sh/legal-assistant.png)

Technologies used:
- [Sveltekit](https://kit.svelte.dev/)
- [LangChanJs](https://js.langchain.com/docs/get_started/introduction/)
- [HNSlib Vector Store](https://github.com/nmslib/hnswlib)
- [OpenAI Embedding API](https://platform.openai.com/docs/guides/embeddings)


> [!WARNING]
> Disclaimer: The answers provided by this projects does not constitute legal advice, it is intended solely for general informational purposes only.

## Setup

### Installing and setting up the vector store
Download the RCW.zip that contains markdown files of the law text by running the following script.

```bash
./scripts/dl-data.sh
```

Create the vector db from the markdown files
```bash
npm run ingest
```

Test that it works by running
```bash
npm run query
```

##  Run

Run the server and open the URL the browser
```bash
npm run dev
```

