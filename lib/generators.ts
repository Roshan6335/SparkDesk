/**
 * Shared generation logic for SparkDesk's content tools.
 *
 * Extracted out of the individual API routes so both the standalone tool
 * pages (Docs, Slides) AND the chat orchestrator can call the exact same
 * generation logic without duplicating prompts.
 */

import { generateCompletion, repairAndParseJSON } from "./ai-client";

export type Slide = {
  title: string;
  bullets: string[];
  speakerNotes: string;
};

export type Deck = {
  title: string;
  slides: Slide[];
};

export async function generateDocument(topic: string, style?: string): Promise<string> {
  const styleInstruction =
    style === "bullet"
      ? "Format as clean bullet-point notes with short sub-bullets where useful."
      : style === "exam"
      ? "Format as exam-ready study notes: definitions, key points, and a short summary at the end."
      : "Format as a well-structured document with clear headings and short paragraphs.";

  const systemPrompt = {
    role: "system" as const,
    content:
      "You are SparkDesk's document generator. Produce clean, well-organized markdown output. Use headings (##), bullet points, and bold for key terms where helpful. Do not add meta-commentary about being an AI.",
  };

  const userPrompt = {
    role: "user" as const,
    content: `Write a clear, well-structured document on the following topic: "${topic}". ${styleInstruction}`,
  };

  return generateCompletion({
    messages: [systemPrompt, userPrompt],
    temperature: 0.6,
    maxTokens: 2000,
  });
}

export type SheetData = {
  title: string;
  headers: string[];
  rows: string[][];
};

export type ChartSpec = {
  type: "bar" | "line" | "pie";
  title: string;
  data: { label: string; value: number }[];
};

export type DashboardData = {
  title: string;
  charts: ChartSpec[];
};

export type FlowchartData = {
  title: string;
  mermaid: string;
};

export type InvoiceItem = { description: string; quantity: number; unitPrice: number };
export type InvoiceData = {
  invoiceNumber: string;
  date: string;
  from: string;
  to: string;
  items: InvoiceItem[];
  notes?: string;
};

export type InfographicData = {
  title: string;
  stats: { label: string; value: string }[];
  points: string[];
};

export type FactCheckResult = {
  verdict: "true" | "false" | "misleading" | "unverifiable";
  explanation: string;
  sources: { title: string; url: string }[];
};

export async function generateSummary(text: string): Promise<string> {
  const systemPrompt = {
    role: "system" as const,
    content:
      "You are SparkDesk's summarizer. Condense the given text into its key points — clear, faithful to the source, no added opinion. Use short bullet points unless the text is very short, in which case a tight paragraph is fine.",
  };
  const userPrompt = {
    role: "user" as const,
    content: `Summarize the following:\n\n${text}`,
  };
  return generateCompletion({ messages: [systemPrompt, userPrompt], temperature: 0.4, maxTokens: 800 });
}

export async function generateCoverLetter(resume: string, jobPost: string): Promise<string> {
  const systemPrompt = {
    role: "system" as const,
    content:
      "You write tailored, professional cover letters for SparkDesk users. Match the candidate's real background to the job's actual requirements — specific, not generic. Three to four short paragraphs. No placeholders like [Company Name] left unfilled if the info is available in the job post.",
  };
  const userPrompt = {
    role: "user" as const,
    content: `Candidate's resume / background:\n${resume}\n\nJob posting:\n${jobPost}\n\nWrite the cover letter.`,
  };
  return generateCompletion({ messages: [systemPrompt, userPrompt], temperature: 0.6, maxTokens: 900 });
}

export async function generateSheet(prompt: string): Promise<SheetData> {
  const systemPrompt = {
    role: "system" as const,
    content: `You generate spreadsheet data for SparkDesk. Respond ONLY with valid JSON, no markdown fences, matching exactly:
{"title": string, "headers": string[], "rows": string[][]}
6-15 rows depending on what's reasonable for the request. Every row array must have the same length as headers.`,
  };
  const userPrompt = { role: "user" as const, content: `Build a spreadsheet for: "${prompt}"` };
  const raw = await generateCompletion({
    messages: [systemPrompt, userPrompt],
    temperature: 0.5,
    maxTokens: 1800,
    jsonMode: true,
  });
  return repairAndParseJSON<SheetData>(raw);
}

export async function generateDashboardData(prompt: string): Promise<DashboardData> {
  const systemPrompt = {
    role: "system" as const,
    content: `You generate dashboard data for SparkDesk. Respond ONLY with valid JSON, no markdown fences, matching exactly:
{"title": string, "charts": [{"type": "bar"|"line"|"pie", "title": string, "data": [{"label": string, "value": number}]}]}
2-4 charts, 4-8 data points each. Pick sensible chart types for the data.`,
  };
  const userPrompt = { role: "user" as const, content: `Build a dashboard for: "${prompt}"` };
  const raw = await generateCompletion({
    messages: [systemPrompt, userPrompt],
    temperature: 0.5,
    maxTokens: 1800,
    jsonMode: true,
  });
  return repairAndParseJSON<DashboardData>(raw);
}

export async function generateResume(details: string): Promise<string> {
  const systemPrompt = {
    role: "system" as const,
    content:
      "You write polished resumes for SparkDesk in clean markdown. Use ## for section headings (Summary, Experience, Education, Skills), bullet points for achievements (action verb + result, quantified where the user gave numbers). Never invent experience the user didn't mention.",
  };
  const userPrompt = {
    role: "user" as const,
    content: `Build a resume from this background:\n\n${details}`,
  };
  return generateCompletion({ messages: [systemPrompt, userPrompt], temperature: 0.5, maxTokens: 1600 });
}

export async function generateFlowchart(process: string): Promise<FlowchartData> {
  const systemPrompt = {
    role: "system" as const,
    content: `You turn process descriptions into Mermaid.js flowchart syntax for SparkDesk. Respond ONLY with valid JSON, no markdown fences, matching exactly:
{"title": string, "mermaid": string}
"mermaid" must be valid Mermaid flowchart syntax starting with "flowchart TD" (top-down). Use short node labels in square brackets, decision points in {curly braces}. Escape any double quotes inside labels. Do not wrap the mermaid string in markdown code fences.`,
  };
  const userPrompt = { role: "user" as const, content: `Turn this process into a flowchart: "${process}"` };
  const raw = await generateCompletion({
    messages: [systemPrompt, userPrompt],
    temperature: 0.3,
    maxTokens: 1200,
    jsonMode: true,
  });
  return repairAndParseJSON<FlowchartData>(raw);
}

export async function generateInvoiceData(details: string): Promise<InvoiceData> {
  const systemPrompt = {
    role: "system" as const,
    content: `You extract structured invoice data for SparkDesk from a plain-language request. Respond ONLY with valid JSON, no markdown fences, matching exactly:
{"invoiceNumber": string, "date": string, "from": string, "to": string, "items": [{"description": string, "quantity": number, "unitPrice": number}], "notes": string}
Invent a reasonable invoiceNumber (e.g. "INV-1001") and today's date if not given. Keep "from"/"to" as short address-style blocks (name + line breaks as \\n).`,
  };
  const userPrompt = { role: "user" as const, content: `Build an invoice for: "${details}"` };
  const raw = await generateCompletion({
    messages: [systemPrompt, userPrompt],
    temperature: 0.3,
    maxTokens: 1000,
    jsonMode: true,
  });
  return repairAndParseJSON<InvoiceData>(raw);
}

export async function generateInfographicData(prompt: string): Promise<InfographicData> {
  const systemPrompt = {
    role: "system" as const,
    content: `You extract infographic-ready content for SparkDesk. Respond ONLY with valid JSON, no markdown fences, matching exactly:
{"title": string, "stats": [{"label": string, "value": string}], "points": string[]}
3-5 standout stats (short label + short value, e.g. {"label": "Global users", "value": "2.4B"}), and 3-6 short punchy points. Every string must be brief — this is a visual, not an essay.`,
  };
  const userPrompt = { role: "user" as const, content: `Build infographic content for: "${prompt}"` };
  const raw = await generateCompletion({
    messages: [systemPrompt, userPrompt],
    temperature: 0.5,
    maxTokens: 900,
    jsonMode: true,
  });
  return repairAndParseJSON<InfographicData>(raw);
}

export async function generatePodcastScript(topic: string): Promise<string> {
  const systemPrompt = {
    role: "system" as const,
    content:
      "You write single-host podcast scripts for SparkDesk — natural spoken language, short sentences, a clear intro/body/outro. No stage directions, no [MUSIC] cues — plain narration text only, ready to be read aloud by a text-to-speech voice.",
  };
  const userPrompt = { role: "user" as const, content: `Write a 2-3 minute podcast script on: "${topic}"` };
  return generateCompletion({ messages: [systemPrompt, userPrompt], temperature: 0.7, maxTokens: 1200 });
}

export async function generateFactCheckVerdict(
  claim: string,
  sources: { title: string; url: string; snippet: string }[]
): Promise<FactCheckResult> {
  const sourcesText = sources
    .map((s, i) => `[${i + 1}] ${s.title} — ${s.snippet} (${s.url})`)
    .join("\n");

  const systemPrompt = {
    role: "system" as const,
    content: `You are SparkDesk's fact checker. Weigh the claim against the provided search sources ONLY — don't rely on prior knowledge if it conflicts with the sources. Respond ONLY with valid JSON, no markdown fences, matching exactly:
{"verdict": "true"|"false"|"misleading"|"unverifiable", "explanation": string, "sources": [{"title": string, "url": string}]}
"explanation" should be 2-4 sentences, plain and direct. Only cite sources that were actually relevant. If the sources don't clearly settle it, use "unverifiable".`,
  };
  const userPrompt = {
    role: "user" as const,
    content: `Claim: "${claim}"\n\nSearch results:\n${sourcesText || "(no results found)"}`,
  };
  const raw = await generateCompletion({
    messages: [systemPrompt, userPrompt],
    temperature: 0.2,
    maxTokens: 700,
    jsonMode: true,
  });
  return repairAndParseJSON<FactCheckResult>(raw);
}

export async function generatePresentation(topic: string, slideCount?: number): Promise<Deck> {
  const count = Math.min(Math.max(slideCount ?? 8, 4), 15);

  const systemPrompt = {
    role: "system" as const,
    content: `You generate presentation outlines for SparkDesk. Respond ONLY with valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"title": string, "slides": [{"title": string, "bullets": string[], "speakerNotes": string}]}
Each slide should have 3-5 concise bullets and 1-2 sentences of speaker notes.`,
  };

  const userPrompt = {
    role: "user" as const,
    content: `Create a ${count}-slide presentation outline on: "${topic}".`,
  };

  const raw = await generateCompletion({
    messages: [systemPrompt, userPrompt],
    temperature: 0.6,
    maxTokens: 2500,
    jsonMode: true,
  });

  const parsed = repairAndParseJSON<Deck>(raw);

  if (!parsed.slides || !Array.isArray(parsed.slides)) {
    throw new Error("Model output missing slides array");
  }

  return parsed;
}
