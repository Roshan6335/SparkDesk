export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string; // lucide-react icon name, resolved in ToolIcon component
  status: "live" | "soon";
  href?: string; // required when status is "live"
};

export const TOOLS: Tool[] = [
  // ---- LIVE ----
  {
    slug: "chat",
    name: "AI Chat",
    description: "General-purpose assistant for quick questions and ideas.",
    category: "Writing & Content",
    icon: "MessageSquare",
    status: "live",
    href: "/workspace/chat",
  },
  {
    slug: "notes",
    name: "AI Notes & Document Generator",
    description: "Turn a topic or messy notes into a clean, structured document.",
    category: "Writing & Content",
    icon: "FileText",
    status: "live",
    href: "/workspace/notes",
  },
  {
    slug: "presentation",
    name: "AI Presentation Outliner",
    description: "Generate a slide-by-slide outline with speaker notes from any topic.",
    category: "Business & Productivity",
    icon: "Presentation",
    status: "live",
    href: "/workspace/presentation",
  },

  // ---- COMING SOON ----
  { slug: "summarizer", name: "AI Summarizer", description: "Condense long text or articles into key points.", category: "Writing & Content", icon: "AlignLeft", status: "soon" },
  { slug: "cover-letter", name: "AI Cover Letter Generator", description: "Tailored cover letters from your resume and a job post.", category: "Writing & Content", icon: "Mail", status: "soon" },
  { slug: "fact-checker", name: "AI Fact Checker", description: "Cross-check claims against sources.", category: "Writing & Content", icon: "CheckCircle2", status: "soon" },

  { slug: "image-generator", name: "AI Image Generator", description: "Generate images from text prompts.", category: "Design & Visuals", icon: "Image", status: "soon" },
  { slug: "photo-editor", name: "AI Photo Editor", description: "Edit and enhance photos with prompts.", category: "Design & Visuals", icon: "Wand2", status: "soon" },
  { slug: "logo-generator", name: "AI Logo Generator", description: "Generate logo concepts for your brand.", category: "Design & Visuals", icon: "Shapes", status: "soon" },
  { slug: "infographic", name: "AI Infographic Generator", description: "Turn data or ideas into a shareable infographic.", category: "Design & Visuals", icon: "BarChart3", status: "soon" },

  { slug: "voice-tts", name: "AI Text to Speech", description: "Convert text into natural-sounding voice.", category: "Audio & Video", icon: "Volume2", status: "soon" },
  { slug: "video-generator", name: "AI Video Generator", description: "Generate short videos from a prompt.", category: "Audio & Video", icon: "Video", status: "soon" },
  { slug: "podcast-generator", name: "AI Podcast Generator", description: "Turn a topic or article into a podcast script + audio.", category: "Audio & Video", icon: "Mic", status: "soon" },

  { slug: "spreadsheet", name: "AI Spreadsheet Generator", description: "Build and analyze spreadsheets from a prompt.", category: "Business & Productivity", icon: "Table", status: "soon" },
  { slug: "dashboard-builder", name: "AI Dashboard Generator", description: "Ask a question in plain English, get a live dashboard.", category: "Business & Productivity", icon: "LayoutDashboard", status: "soon" },
  { slug: "resume-builder", name: "AI Resume Builder", description: "Build a polished resume from your work history.", category: "Business & Productivity", icon: "FileUser", status: "soon" },
  { slug: "flowchart", name: "AI Flowchart Generator", description: "Turn a process description into a flowchart.", category: "Business & Productivity", icon: "Workflow", status: "soon" },
  { slug: "invoice-generator", name: "AI Invoice Generator", description: "Generate professional invoices in seconds.", category: "Business & Productivity", icon: "Receipt", status: "soon" },
];

export const CATEGORIES = Array.from(new Set(TOOLS.map((t) => t.category)));

export function getLiveTools() {
  return TOOLS.filter((t) => t.status === "live");
}

export function getComingSoonTools() {
  return TOOLS.filter((t) => t.status === "soon");
}
