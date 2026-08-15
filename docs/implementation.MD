# Implementation Plan — AI Legal Intelligence Platform

## Phase 0: Foundations, Validation & Go/No-Go Decisions

**Objective:** Resolve the things that change the entire plan if wrong, before writing product code.

**Activities:**

- Confirm IndianKanoon API access in writing (rate limits, ToS for storing/displaying retrieved content, cost at scale beyond free tier, what "use-case verification" actually requires and how long it takes). If access is denied or delayed, decide the fallback source _now_ (e.g., a different legal database, or scoping FR6 out of MVP entirely) — don't let this surface mid-Phase-5.
- Run the lawyer validation conversation. Walk away with: which pain point is actually worse day-to-day (timeline vs. precedent search), what "good enough" accuracy looks like to a practitioner, and what would make them distrust the tool immediately.
- Freeze MVP scope in writing based on the above two answers.
- Decide data residency / hosting constraints now — legal documents may have jurisdictional storage requirements. Don't discover this after Postgres is already provisioned in the wrong region.
- Set up basic engineering hygiene: repo structure, environment config, secrets management (no API keys in code, ever — this includes LLM keys and any legal-DB keys), CI skeleton.

**Exit criteria (must all be true to proceed):**

- IndianKanoon path is either confirmed-usable or explicitly descoped with a documented fallback.
- Lawyer has confirmed at least one pain point in person, not assumed.
- MVP feature list is written down and nobody is silently still planning to build V2/V3 features "while they're at it."

---

## Phase 1: Architecture, Contracts & Evaluation Framework

**Objective:** Design the system _and_ design how you'll know if each AI component is working — before building any of them. This is the step most teams skip, and it's the reason AI features ship and then quietly underperform for months with nobody noticing.

**Activities:**

- Finalize DB schema (Postgres tables for users, cases, documents, extracted entities, timeline events).
- Define API contracts between frontend/backend/AI pipeline — do this before parallel workstreams start, or integration in Phase 7 becomes a nightmare.
- **Build a small "golden set" for every AI component you plan to ship:**
  - 15–20 real (or realistic) sample documents across FIRs, chargesheets, judgments, contracts — varied quality, including at least a few bad scans.
  - Hand-label the correct extracted entities, correct summary, correct timeline for each.
  - This golden set is what every later phase gets measured against. Without it, "does the NER work" is a matter of opinion, not evidence.
- Define what "acceptable" looks like numerically for each stage (e.g., OCR word-error-rate threshold, NER field-level precision/recall target, summarization factual-consistency check). Pick real numbers now, even rough ones — revise later, but have a bar.
- System architecture diagram, AI workflow diagram (per earlier PRD architecture — Postgres, Redis, Chroma, FastAPI, Next.js).

**Exit criteria:**

- Golden set exists and is version-controlled.
- Every AI-driven feature in MVP scope has a measurable definition of "working."

---

## Phase 2: Core Platform (Non-AI Foundation)

**Objective:** Build the boring, deterministic part first and get it fully solid. No AI dependency here — this should be the most stable code in the system.

**Activities:**

- Auth (JWT), user accounts, role scaffolding.
- Case management CRUD.
- Document upload (PDF/image), file storage, metadata record creation.
- Postgres schema live, basic backend REST APIs, frontend shell connected end-to-end.

**Exit criteria:**

- A lawyer can log in, create a case, upload a document, and see it stored — zero AI involved yet.
- Basic integration + unit test coverage on this layer, since everything else depends on it staying correct.

---

## Phase 3: Document Processing Pipeline (OCR + Parsing)

**Objective:** Get clean text out of documents reliably, and _know_ when you didn't.

**Activities:**

- PyMuPDF/pdfplumber for digital PDFs.
- Tesseract OCR for scans; route to paid OCR fallback (Textract/Vision) if you've budgeted for it.
- Build a confidence signal — even a crude one (OCR engine's own confidence score, or simple heuristics like % of dictionary words recognized) — and store it alongside extracted text.
- Text cleaning/preprocessing.

**Testing gate (do not skip):**

- Run the full golden set through this pipeline. Measure extraction accuracy against your Phase 1 threshold.
- Specifically check the worst-quality scans — this is where the pipeline will actually fail in production, not on clean PDFs.
- If accuracy is below bar, this is the moment to swap OCR engines or add paid fallback — not after entity extraction is already built on top of bad text.

**Exit criteria:**

- Extraction accuracy meets the threshold set in Phase 1, or the gap is documented and explicitly accepted.
- Low-confidence documents are flagged in the data, not silently passed downstream as if they were clean.

---

## Phase 4: Entity Extraction & Timeline Generation

**Objective:** Turn clean text into structured facts, with a human correction path built in from day one — not bolted on later.

**Activities:**

- NER via spaCy baseline first (don't jump straight to a custom-trained model — measure the baseline against your golden set first, only invest in fine-tuning if the baseline genuinely underperforms).
- Regex/rule-based assists for structured fields (FIR numbers, section citations) — these are often more reliable than ML for rigid formats.
- Chronological ordering logic for timeline construction.
- **Build the manual-correction UI now.** Extraction will be wrong sometimes. A lawyer needs to be able to fix a wrong date or misattributed party name directly, and that correction should be logged — it's your first real source of labeled data for future improvement.

**Testing gate:**

- Field-level precision/recall against golden set, per entity type (dates vs. names vs. section numbers — these will have very different accuracy, don't average them into one meaningless number).
- Specifically test on documents with mixed English/regional-language content and both old (IPC/CrPC) and new (BNS/BNSS) section references — this is a known hard case, confirm it before assuming it works.

**Exit criteria:**

- Timeline is generated end-to-end from upload.
- Correction UI works and corrections persist.
- Known failure modes (language mixing, statute-framework confusion) are documented even if not fully solved.

---

## Phase 5: Retrieval Infrastructure (Vector DB, Before Any Generation)

**Objective:** Prove retrieval works _before_ connecting an LLM to it. This is the step that most directly prevents hallucinated case law later.

**Activities:**

- Stand up Chroma. Define chunking strategy for judgments (this matters more than people expect — chunk boundaries affect retrieval quality significantly).
- Generate embeddings for a test corpus of judgments (from IndianKanoon or fallback source resolved in Phase 0).
- Build the retrieval query path: case facts → embedding → top-N similar judgment retrieval.
- Redis caching for repeated queries.

**Testing gate:**

- For a set of test queries with known relevant judgments, measure retrieval precision/recall (does the right judgment show up in the top-N?) — evaluated _without_ the LLM in the loop yet. This isolates retrieval quality from generation quality, which is critical for debugging later.
- Confirm every retrieved result carries a working, storable source link/citation. If a result can't be traced back to a source, it doesn't go in the index.

**Exit criteria:**

- Retrieval precision meets threshold on test queries.
- 100% of retrieved results have a valid source reference — no exceptions, since this is what FR6's grounding guarantee depends on.

---

## Phase 6: Grounded Generation (LLM Layer, Still No Agent Yet)

**Objective:** Connect the LLM to retrieval and summarization, with hallucination controls as a first-class requirement, not a hoped-for side effect.

**Activities:**

- Document summarization: prompt design, output format, and explicit instruction to only use provided source text.
- Similar-case explanation: LLM generates the "why this is relevant" text _only_ from retrieved judgment text (Phase 5 output) — never from model memory alone.
- **Enforce citation-or-nothing at the code level, not just the prompt level:** if the generation pipeline can't attach a source link to a claim, that claim gets filtered out before it reaches the user. Don't rely on the LLM to police itself.
- Prompt versioning from the start — store prompts with version identifiers, log which version produced which output. You will change prompts constantly; you need to know what changed when quality shifts.

**Testing gate:**

- Manual factual-consistency review on golden-set summaries: does every claim in the summary trace back to the source document?
- Specifically stress-test for hallucinated citations — feed it edge cases (very short documents, documents with no clear outcome) and confirm it doesn't invent one.

**Exit criteria:**

- Summarization and similar-case generation are live, grounded, and every output that references external content has a working link attached.
- A documented process exists for what happens when generation fails the consistency check (falls back to "no summary available" rather than a plausible-sounding guess).

---

## Phase 7: Agent Layer (Only Now)

**Objective:** Add orchestration on top of components that are each already individually proven. This is the phase most likely to cause the "issues" you're trying to avoid, so it gets the most detail.

**Design decisions to make explicitly, not by default:**

- **Start with a fixed pipeline, not a free-roaming agent.** Given the MVP scope (upload → OCR → NER → timeline, and separately, query → retrieve → summarize), you likely don't need dynamic tool-selection yet. A hardcoded sequence is easier to test, debug, and reason about than an agent deciding its own steps. Only introduce a planner/router once you have a concrete case where the fixed path genuinely isn't enough (e.g., a chat interface where the user's question determines which tools to call).
- **If/when you do add a router (for the AI chat assistant, V2):**
  - Define a small, fixed set of tools with strict input/output schemas (e.g., `extract_dates(doc_id)`, `find_similar_cases(query)`, `summarize(doc_id)`) — not open-ended free-text tool calls.
  - Cap the number of tool calls per user turn (prevents runaway loops and runaway cost).
  - Log every tool call, its input, its output, and the reasoning step that led to it — you need this for debugging when it does something unexpected, and it will.
  - Add a timeout and a fallback response for every tool — an agent that hangs or errors silently is worse than one that says "I couldn't complete that."
- **Guardrails that are non-negotiable regardless of architecture:**
  - The agent cannot fabricate a legal citation under any code path — this inherits directly from Phase 6's enforcement, just needs to survive the added complexity of routing.
  - The agent cannot take a destructive or external action (sending something, filing something) without explicit user confirmation — at this stage the agent should be read/analyze-only.
  - Rate/cost limits per user per day — LLM agent loops can burn budget fast if something goes wrong.

**Testing gate:**

- Adversarial testing: deliberately ambiguous or malformed queries, documents with missing fields, conflicting dates — confirm the agent degrades gracefully (says "I don't have enough information") rather than confidently guessing.
- Trace review: for a sample of real interactions, manually review the full tool-call trace, not just the final answer. Agent bugs hide in the reasoning steps, not just the output.

**Exit criteria:**

- Every agent action is logged and traceable end-to-end.
- Failure modes (timeout, tool error, ambiguous input) all have defined, tested fallback behavior — none of them are allowed to just crash or hallucinate a plausible-sounding answer.

---

## Phase 8: Personalization & Pattern Memory

**Objective:** Add per-lawyer memory only after the shared/general pipeline is trustworthy — personalization on top of unreliable extraction just personalizes the errors.

**Activities:**

- Per-user vector store partition (isolation is a hard requirement — one lawyer's case data must never leak into another's retrieval results; test this explicitly, don't assume namespacing works).
- Deterministic stats (average days between hearings, etc.) via plain SQL — resist the urge to route this through the LLM; it's slower, costs money, and a database can do arithmetic exactly.
- Pattern surfacing (e.g., "Section X cited inconsistently in 3 past cases") — should read as an observation with the underlying evidence linked, not an unexplained assertion.
- Explicitly handle cold start: what does a new user see before they've logged enough cases for patterns to be meaningful? Don't show a broken/empty feature — hide it until there's enough data, and say so.

**Exit criteria:**

- Cross-user isolation is tested and confirmed, not assumed.
- Cold-start state is handled gracefully in the UI.

---

## Phase 9: WhatsApp Channel

**Objective:** Extend a now-proven pipeline to a second input surface — this is integration work, not new AI risk, which is exactly why it comes after the core is stable.

**Activities:**

- Twilio/Meta WhatsApp Business API integration.
- Route uploaded media through the same Phase 3–6 pipeline (do not build a parallel/duplicate pipeline for WhatsApp — same code path, different entry point).
- Handle WhatsApp-specific constraints: file size limits, message formatting for summaries, async response delivery (processing takes minutes, WhatsApp expects fast turnaround, so this needs a "processing, we'll message you" pattern).

**Exit criteria:**

- Same accuracy/grounding guarantees as the web path — no degraded version snuck in for expedience.

---

## Phase 10: Security, Compliance & Hardening

**Objective:** This should be threaded through every phase above, not a checkbox phase at the end — but formal review and hardening happens here regardless.

**Activities:**

- Encryption at rest and in transit confirmed across all storage (Postgres, Chroma, file storage) — verify, don't assume it was configured correctly earlier.
- Access control audit — confirm one user genuinely cannot access another's data anywhere in the stack, including logs and caches.
- Secrets/key rotation process.
- Legal/ethical review of every disclaimer surface (per FR8) — get actual sign-off, not just "we added a banner."
- Data retention and deletion policy — what happens when a lawyer deletes a case? Does it purge from the vector store, cache, and backups too?

**Exit criteria:**

- Security review passed, documented, with any exceptions explicitly accepted (not silently deferred).

---

## Phase 11: Testing, Pilot & Iteration

**Objective:** Validate with a real user before calling this done.

**Activities:**

- Full regression pass against the golden set across all components together (not just individually — confirm the _end-to-end_ pipeline still meets thresholds once everything is connected).
- Docker containerization, cloud deployment (per architecture).
- Pilot with the validated lawyer contact from Phase 0 — real documents, real usage, not a scripted demo.
- Collect what breaks. Prioritize fixes by what actually blocked the lawyer versus what's cosmetic.

**Exit criteria:**

- Pilot user confirms measurable time savings on at least one core workflow (timeline or precedent search — whichever Phase 0 identified as the bigger pain point).
- No unresolved hallucination or data-leak issues from the pilot.

---
