/**
 * Video templates/presets for quick video creation
 */

import { VideoSettings } from "@/types";

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: "product" | "education" | "news" | "social" | "marketing" | "entertainment";
  icon: string;
  settings: VideoSettings;
  stylePrompt: string;
  exampleText?: string;
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: "product-showcase",
    name: "Presentación de Producto",
    description: "Presenta tus productos de forma impactante",
    category: "product",
    icon: "📦",
    settings: {
      duration: 15,
      resolution: "1080p",
      style: "professional",
    },
    stylePrompt: "A professional product showcase with clean background, modern lighting, and cinematic camera movements",
    exampleText: "Descubre este increíble producto. Alta calidad, precio accesible y satisfacción garantizada.",
  },
  {
    id: "educational-tutorial",
    name: "Video Educativo",
    description: "Para contenido informativo y didáctico",
    category: "education",
    icon: "📚",
    settings: {
      duration: 30,
      resolution: "1080p",
      style: "friendly",
    },
    stylePrompt: "An educational tutorial with clear explanations, friendly presenter, and informative visuals",
    exampleText: "Hoy te voy a mostrar cómo trabajar de forma más productiva. Empecemos hablando de técnicas de gestión del tiempo...",
  },
  {
    id: "news-announcement",
    name: "Anuncio de Noticias",
    description: "Formato profesional para noticias y comunicados",
    category: "news",
    icon: "📰",
    settings: {
      duration: 20,
      resolution: "1080p",
      style: "professional",
    },
    stylePrompt: "A news announcement with professional presenter, newsroom background, and authoritative tone",
    exampleText: "Comunicado importante: queremos informarte sobre las nuevas funciones y actualizaciones...",
  },
  {
    id: "social-media-short",
    name: "Video Corto para Redes Sociales",
    description: "Videos cortos e impactantes para Instagram y TikTok",
    category: "social",
    icon: "📱",
    settings: {
      duration: 15,
      resolution: "1080p",
      style: "energetic",
    },
    stylePrompt: "A short, energetic social media video with vibrant colors, dynamic movements, and engaging visuals",
    exampleText: "No te pierdas este contenido. Míralo ahora y no olvides darle like. 🎉",
  },
  {
    id: "marketing-promo",
    name: "Promoción de Marketing",
    description: "Para promocionar productos y servicios",
    category: "marketing",
    icon: "🎯",
    settings: {
      duration: 30,
      resolution: "1080p",
      style: "energetic",
    },
    stylePrompt: "A marketing promotion with compelling visuals, persuasive presentation, and call-to-action",
    exampleText: "Oferta especial: 50% de descuento por tiempo limitado. Compra ahora y no dejes pasar esta oportunidad.",
  },
  {
    id: "entertainment-fun",
    name: "Video de Entretenimiento",
    description: "Para contenido divertido y con humor",
    category: "entertainment",
    icon: "🎬",
    settings: {
      duration: 20,
      resolution: "1080p",
      style: "energetic",
    },
    stylePrompt: "An entertaining video with fun atmosphere, playful visuals, and engaging content",
    exampleText: "Hoy te voy a contar una historia muy graciosa. ¿Estás listo? ¡Empezamos! 😄",
  },
];

export function getTemplateById(id: string): VideoTemplate | undefined {
  return VIDEO_TEMPLATES.find((template) => template.id === id);
}

export function getTemplatesByCategory(category: VideoTemplate["category"]): VideoTemplate[] {
  return VIDEO_TEMPLATES.filter((template) => template.category === category);
}

export function getAllCategories(): VideoTemplate["category"][] {
  return Array.from(new Set(VIDEO_TEMPLATES.map((t) => t.category)));
}
