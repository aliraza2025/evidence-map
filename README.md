# Evidence Map

An evidence-first product discovery workbench. Keep interview quotes attached to tentative opportunities, make prioritization assumptions explicit, and export the reasoning together with a proposed experiment.

**[Open the working demo](https://aliraza2025.github.io/evidence-map/)** · [Product case study](CASE_STUDY.md) · [Portfolio copy](PORTFOLIO.md)

Status: independent prototype, v0.1.0. Built by Ali Raza with AI-assisted implementation.

## What works

- Line-addressable interview observations with participant labels and exact text.
- A service-operations keyword baseline plus optional local-model opportunity extraction.
- Server-side validation rejecting unknown sources and quotations that are not exact substrings of the cited line.
- Source navigation, editable hypotheses, and explicit operator review status.
- Evidence breadth by source line and participant label, kept separate from RICE assumptions.
- Adjustable RICE inputs, ranking, JSON round trips, and a source-linked discovery brief export.

## Try the workflow

Load the fictional example, select **Give follow-up an owner**, and follow its source links. Change the reach or effort assumptions to see the ranking change. Mark a hypothesis reviewed and export the discovery brief. The source text, review status, qualifications, and assumptions travel with the export.

For your own observations, use one line per observation:

```text
P01 | Exact interview text goes here.
P02 | Another observation goes here.
```

Participant labels identify records; they do not independently verify a person's identity or the representativeness of the sample.

## Optional local AI

The published GitHub Pages demo supports the mode that needs no model. Real model-assisted generation is available through the local Node server.

1. Install [Ollama](https://ollama.com/) from its official source and install a model that supports structured output. Check its model license and hardware requirements.
2. Start Ollama with that model available.
3. Start this repository with the exact installed model name:

```bash
OLLAMA_MODEL=your-installed-model npm start
```

Open the printed local URL and choose **Local AI** before generating. `OLLAMA_BASE_URL` optionally overrides `http://127.0.0.1:11434`. Only use an endpoint you trust: that endpoint receives the submitted brief or transcript. The browser never chooses an arbitrary model endpoint. The server binds to loopback, accepts same-origin requests, bounds request size, times out model calls, and validates the returned artifact. It does not silently substitute a template when AI fails.

The adapter follows Ollama's [chat API](https://docs.ollama.com/api/chat) and [structured-output contract](https://docs.ollama.com/capabilities/structured-outputs). No model server was available during initial verification, so the adapter and failure paths were tested using simulated HTTP responses, not live model inference. A real model's speed and output quality remain to be evaluated.

## Development

Requires Node.js 22 or newer. No npm packages, API keys, or paid services are needed for the browser demo.

```bash
npm test
npm run build
npm start
```

`public/` is the source for the browser application. `docs/` is its generated GitHub Pages version; run `npm run build` after changing the browser source. The tests use Node's built-in runner. HTTP integration tests open temporary loopback ports. CI runs the tests and verifies that the generated demo is current.

## Ownership and scope

An original independent prototype built for Ali Raza's portfolio with AI-assisted implementation. Product framing, source, sample fixtures, and interface are included in this repository. No source code, branding, assets, or employment claims were copied from Adnan Khan's projects. The repository is not affiliated with those projects or the reference libraries below.

This is a working prototype, not a customer deployment. No user interviews, revenue, adoption, business savings, or production reliability are claimed. Example records are synthetic. See [CASE_STUDY.md](CASE_STUDY.md) for the product reasoning and [PORTFOLIO.md](PORTFOLIO.md) for accurate portfolio copy.

License: [MIT](LICENSE). Model weights used with an optional local model have their own licenses.

## Limits

The keyword baseline recognizes a small set of English service-operations themes. Unmatched observations remain in an uncategorized group. The model mode can propose a misleading hypothesis even with perfectly matched quotes. The tool validates citation text, not logical entailment, research quality, or participant consent. Default RICE values are placeholders, not inferred research findings. Projects stay in memory until exported; there is no automatic cloud persistence, authentication, embedding index, or collaboration.

## References considered

- [Adnan Khan: OM5](https://adnankhan.ai/work/om5): reference for making discovery, decisions, and evidence inspectable. No implementation copied.
- [Transformers.js](https://github.com/huggingface/transformers.js), Apache-2.0: reviewed as a future browser-local semantic retrieval option. It is not installed or used here; this prototype has no embedding model.
- [Ollama](https://github.com/ollama/ollama), MIT: optional runtime used through its documented structured-output API. Model weights are not bundled.
