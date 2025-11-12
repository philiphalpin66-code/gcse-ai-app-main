import { 
  Calculator, BookText, BookOpen, Dna, FlaskConical, Telescope,
  Globe2, Landmark, Monitor, HeartPulse, Languages, Flag, LineChart,
  Briefcase, Cog, Dumbbell, Palette, Music, ScrollText
} from "lucide-react";

export const subjectVisuals = {
  "Maths":              { icon: Calculator,         color: "#FFD43B", gradient: "from-yellow-300 to-orange-400" },
  "English Language":   { icon: BookText,           color: "#FF8A80", gradient: "from-pink-400 to-rose-500" },
  "English Literature": { icon: BookOpen,           color: "#F06292", gradient: "from-fuchsia-400 to-purple-500" },
  "Biology":            { icon: Dna,                color: "#4CAF50", gradient: "from-green-400 to-emerald-500" },
  "Chemistry":          { icon: FlaskConical,       color: "#81D4FA", gradient: "from-sky-400 to-cyan-500" },
  "Physics":            { icon: Telescope,          color: "#9575CD", gradient: "from-indigo-400 to-purple-500" },
  "Combined Science":   { icon: FlaskConical,       color: "#29B6F6", gradient: "from-cyan-400 to-blue-500" },
  "Geography":          { icon: Globe2,             color: "#81C784", gradient: "from-green-400 to-lime-500" },
  "History":            { icon: Landmark,           color: "#A1887F", gradient: "from-amber-400 to-orange-600" },
  "Computer Science":   { icon: Monitor,            color: "#26C6DA", gradient: "from-cyan-400 to-sky-500" },
  "Religious Studies":  { icon: ScrollText,         color: "#BA68C8", gradient: "from-purple-400 to-violet-500" },
  "French":             { icon: Languages,          color: "#64B5F6", gradient: "from-blue-400 to-indigo-500" },
  "Spanish":            { icon: Flag,               color: "#FF7043", gradient: "from-red-400 to-orange-500" },
  "German":             { icon: Flag,               color: "#FBC02D", gradient: "from-yellow-400 to-amber-500" },
  "Business":           { icon: Briefcase,          color: "#42A5F5", gradient: "from-sky-400 to-blue-500" },
  "Economics":          { icon: LineChart,          color: "#66BB6A", gradient: "from-green-400 to-teal-500" },
  "Design & Technology":{ icon: Cog,                color: "#FFB74D", gradient: "from-amber-400 to-orange-600" },
  "Physical Education": { icon: Dumbbell,           color: "#29B6F6", gradient: "from-blue-400 to-teal-500" },
  "Art & Design":       { icon: Palette,            color: "#E57373", gradient: "from-pink-400 to-rose-500" },
  "Music":              { icon: Music,              color: "#7986CB", gradient: "from-indigo-400 to-blue-500" },
};
