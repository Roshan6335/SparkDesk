import {
  MessageSquare,
  FileText,
  Presentation,
  AlignLeft,
  Mail,
  CheckCircle2,
  Image as ImageIcon,
  Wand2,
  Shapes,
  BarChart3,
  Volume2,
  Video,
  Mic,
  Table,
  LayoutDashboard,
  FileUser,
  Workflow,
  Receipt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  MessageSquare,
  FileText,
  Presentation,
  AlignLeft,
  Mail,
  CheckCircle2,
  Image: ImageIcon,
  Wand2,
  Shapes,
  BarChart3,
  Volume2,
  Video,
  Mic,
  Table,
  LayoutDashboard,
  FileUser,
  Workflow,
  Receipt,
};

export function ToolIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICONS[name] || Sparkles;
  return <Icon className={className} style={style} />;
}
