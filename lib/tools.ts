export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string; // lucide-react icon name, resolved in ToolIcon component
  color: string; // tailwind-safe hex-free token key, resolved in ToolIcon wrapper
  status: "live" | "soon";
  href?: string; // required when status is "live"
};

// Each category gets a distinct accent so the workspace reads like a
// color-coded gallery at a glance, rather than one uniform brand-purple grid.
// `fg` is the accent used for icon glow/stroke on the dark glass surface.
const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  "Writing & Content": { bg: "rgba(132,125,255,0.14)", fg: "#847dff" },
  "Design & Visuals": { bg: "rgba(221,144,216,0.14)", fg: "#dd90d8" },
  "Audio & Video": { bg: "rgba(144,184,240,0.14)", fg: "#90b8f0" },
  "Business & Productivity": { bg: "rgba(75,73,170,0.22)", fg: "#a29dff" },
};

// Short editorial description + icon for each category's showcase card on
// the homepage. Kept separate from per-tool descriptions.
export const CATEGORY_META: Record<string, { description: string; icon: string }> = {
  "Writing & Content": {
    description: "Chat, docs, and long-form drafts — shaped into structure automatically.",
    icon: "FileText",
  },
  "Design & Visuals": {
    description: "Images, logos, and infographics generated straight from a prompt.",
    icon: "Wand2",
  },
  "Audio & Video": {
    description: "Voice, short video, and podcast scripts — spoken and edited by AI.",
    icon: "Video",
  },
  "Business & Productivity": {
    description: "Sheets, dashboards, resumes, and invoices — built from plain English.",
    icon: "LayoutDashboard",
  },
};

export const TOOLS: Tool[] = [
  // ---- LIVE ----
  {
    slug: "chat",
    name: "AI Chat",
    description: "General-purpose assistant for quick questions and ideas.",
    category: "Writing & Content",
    icon: "MessageSquare",
    color: "Writing & Content",
    status: "live",
    href: "/workspace/chat",
  },
  {
    slug: "notes",
    name: "AI Docs",
    description: "Turn a topic or messy notes into a clean, structured document.",
    category: "Writing & Content",
    icon: "FileText",
    color: "Writing & Content",
    status: "live",
    href: "/workspace/notes",
  },
  {
    slug: "presentation",
    name: "AI Slides",
    description: "Generate a full, designed slide deck from any topic.",
    category: "Business & Productivity",
    icon: "Presentation",
    color: "Business & Productivity",
    status: "live",
    href: "/workspace/presentation",
  },

  // ---- COMING SOON ----
  { slug: "summarizer", name: "AI Summarizer", description: "Condense long text or articles into key points.", category: "Writing & Content", icon: "AlignLeft", color: "Writing & Content", status: "soon" },
  { slug: "cover-letter", name: "AI Cover Letter Generator", description: "Tailored cover letters from your resume and a job post.", category: "Writing & Content", icon: "Mail", color: "Writing & Content", status: "soon" },
  { slug: "fact-checker", name: "AI Fact Checker", description: "Cross-check claims against sources.", category: "Writing & Content", icon: "CheckCircle2", color: "Writing & Content", status: "soon" },

  { slug: "image-generator", name: "AI Image", description: "Generate images from text prompts.", category: "Design & Visuals", icon: "Image", color: "Design & Visuals", status: "soon" },
  { slug: "photo-editor", name: "AI Photo Editor", description: "Edit and enhance photos with prompts.", category: "Design & Visuals", icon: "Wand2", color: "Design & Visuals", status: "soon" },
  { slug: "logo-generator", name: "AI Logo Generator", description: "Generate logo concepts for your brand.", category: "Design & Visuals", icon: "Shapes", color: "Design & Visuals", status: "soon" },
  { slug: "infographic", name: "AI Infographic", description: "Turn data or ideas into a shareable infographic.", category: "Design & Visuals", icon: "BarChart3", color: "Design & Visuals", status: "soon" },

  { slug: "voice-tts", name: "AI Voice", description: "Convert text into natural-sounding voice.", category: "Audio & Video", icon: "Volume2", color: "Audio & Video", status: "soon" },
  { slug: "video-generator", name: "AI Video", description: "Generate short videos from a prompt.", category: "Audio & Video", icon: "Video", color: "Audio & Video", status: "soon" },
  { slug: "podcast-generator", name: "AI Podcast", description: "Turn a topic or article into a podcast script + audio.", category: "Audio & Video", icon: "Mic", color: "Audio & Video", status: "soon" },

  { slug: "spreadsheet", name: "AI Sheets", description: "Build and analyze spreadsheets from a prompt.", category: "Business & Productivity", icon: "Table", color: "Business & Productivity", status: "soon" },
  { slug: "dashboard-builder", name: "AI Dashboards", description: "Ask a question in plain English, get a live dashboard.", category: "Business & Productivity", icon: "LayoutDashboard", color: "Business & Productivity", status: "soon" },
  { slug: "resume-builder", name: "AI Resume", description: "Build a polished resume from your work history.", category: "Business & Productivity", icon: "FileUser", color: "Business & Productivity", status: "soon" },
  { slug: "flowchart", name: "AI Flowchart", description: "Turn a process description into a flowchart.", category: "Business & Productivity", icon: "Workflow", color: "Business & Productivity", status: "soon" },
  { slug: "invoice-generator", name: "AI Invoice", description: "Generate professional invoices in seconds.", category: "Business & Productivity", icon: "Receipt", color: "Business & Productivity", status: "soon" },
];

export const CATEGORIES = Array.from(new Set(TOOLS.map((t) => t.category)));

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || { bg: "rgba(132,125,255,0.14)", fg: "#847dff" };
}

export function getLiveTools() {
  return TOOLS.filter((t) => t.status === "live");
}

export function getComingSoonTools() {
  return TOOLS.filter((t) => t.status === "soon");
}

export function getCategoryToolCount(category: string) {
  return TOOLS.filter((t) => t.category === category).length;
}
