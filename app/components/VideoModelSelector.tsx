"use client";

import { VideoProvider } from "@/types";

// Los 5 mejores modelos de video gratuitos (por proveedor)
const VIDEO_MODELS = {
  replicate: [
    {
      id: "google/veo-3.1",
      name: "Google Veo 3.1",
      description: "Máxima calidad - compatible con sincronización de audio",
      provider: "Replicate",
      quality: "Muy alta",
      speed: "Media",
      free: true,
      freeNote: "Tier gratuito: 6 peticiones/minuto",
    },
    {
      id: "anotherjesse/zeroscope-v2-xl",
      name: "Zeroscope v2 XL",
      description: "Video de alta calidad - popular y fiable",
      provider: "Replicate",
      quality: "Alta",
      speed: "Rápida",
      free: true,
      freeNote: "Tier gratuito disponible",
    },
    {
      id: "stability-ai/stable-video-diffusion",
      name: "Stable Video Diffusion",
      description: "Stability AI - modelo image-to-video",
      provider: "Replicate",
      quality: "Buena",
      speed: "Rápida",
      free: true,
      freeNote: "Tier gratuito disponible",
    },
    {
      id: "luma/dream-machine",
      name: "Luma Dream Machine",
      description: "Generación de video rápida y de calidad",
      provider: "Replicate",
      quality: "Buena",
      speed: "Muy rápida",
      free: true,
      freeNote: "Tier gratuito disponible",
    },
    {
      id: "meta/animate-anyone",
      name: "Meta Animate Anyone",
      description: "Ideal para animación de personajes",
      provider: "Replicate",
      quality: "Alta",
      speed: "Media",
      free: true,
      freeNote: "Tier gratuito disponible",
    },
  ],
  fal: [
    {
      id: "kling-video/v2.5-turbo/pro/text-to-video",
      name: "Kling 2.5 Turbo Pro",
      description: "Máxima calidad - imágenes cinematográficas, movimiento fluido",
      provider: "Fal.ai",
      quality: "Muy alta",
      speed: "Media",
      free: true,
      freeNote: "100 peticiones gratuitas al día",
    },
    {
      id: "veo3.1/text-to-video",
      name: "Veo 3.1",
      description: "Google DeepMind - generación de video de última generación",
      provider: "Fal.ai",
      quality: "Muy alta",
      speed: "Media",
      free: true,
      freeNote: "100 peticiones gratuitas al día",
    },
    {
      id: "pixverse/v5/text-to-video",
      name: "PixVerse v5",
      description: "Generación de clips de video de alta calidad",
      provider: "Fal.ai",
      quality: "Alta",
      speed: "Rápida",
      free: true,
      freeNote: "100 peticiones gratuitas al día",
    },
    {
      id: "kling-video/v2.6/pro/text-to-video",
      name: "Kling 2.6 Pro",
      description: "Generación de video con soporte de audio",
      provider: "Fal.ai",
      quality: "Muy alta",
      speed: "Media",
      free: true,
      freeNote: "100 peticiones gratuitas al día",
    },
    {
      id: "ltx-2/text-to-video",
      name: "LTX-2 Pro",
      description: "Generación de video y audio de alta calidad",
      provider: "Fal.ai",
      quality: "Alta",
      speed: "Media",
      free: true,
      freeNote: "100 peticiones gratuitas al día",
    },
  ],
  huggingface: [
    {
      id: "replicate/google/veo-3.1",
      name: "Google Veo 3.1 (Replicate)",
      description: "Vía Replicate - máxima calidad",
      provider: "Replicate (via HF)",
      quality: "Muy alta",
      speed: "Media",
      free: true,
      freeNote: "Requiere API key de Replicate",
      note: "Hugging Face Inference API no soporta text-to-video. Usa Replicate.",
    },
    {
      id: "fal-ai/flux/dev",
      name: "FLUX.1-dev (Fal.ai)",
      description: "Vía Fal.ai - alta calidad",
      provider: "Fal.ai (via HF)",
      quality: "Muy alta",
      speed: "Media",
      free: true,
      freeNote: "Requiere API key de Fal.ai",
      note: "Hugging Face Inference API no soporta text-to-video. Usa Fal.ai.",
    },
    {
      id: "tencent/HunyuanVideo",
      name: "HunyuanVideo",
      description: "Tencent - vía Inference API (limitado)",
      provider: "Hugging Face",
      quality: "Buena",
      speed: "Media",
      free: true,
      freeNote: "1000 peticiones gratuitas al día",
      note: "⚠️ Puede no funcionar vía Inference API",
    },
    {
      id: "Lightricks/LTX-Video",
      name: "LTX-Video",
      description: "Lightricks - vía Inference API (limitado)",
      provider: "Hugging Face",
      quality: "Buena",
      speed: "Media",
      free: true,
      freeNote: "1000 peticiones gratuitas al día",
      note: "⚠️ Puede no funcionar vía Inference API",
    },
    {
      id: "recommend-replicate",
      name: "Usa Replicate",
      description: "Hugging Face no es adecuado para text-to-video",
      provider: "Recomendación",
      quality: "N/A",
      speed: "N/A",
      free: true,
      freeNote: "Usa Replicate o Fal.ai",
      note: "💡 Hugging Face Inference API no soporta modelos text-to-video. Te recomendamos usar Replicate o Fal.ai.",
    },
  ],
};

interface VideoModelSelectorProps {
  selectedProvider: VideoProvider;
  selectedModel?: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export default function VideoModelSelector({
  selectedProvider,
  selectedModel,
  onModelChange,
  disabled = false,
}: VideoModelSelectorProps) {
  const availableModels = VIDEO_MODELS[selectedProvider] || VIDEO_MODELS.replicate;
  const currentModel = availableModels.find((m) => m.id === selectedModel) || availableModels[0];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Modelo de video
      </label>
      <select
        value={selectedModel || availableModels[0].id}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {availableModels.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
      
      {currentModel && (
        <div className="mt-2 p-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-xs text-gray-800 dark:text-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-purple-900 dark:text-purple-200">
                {currentModel.name}
              </p>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                {currentModel.provider}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {currentModel.description}
            </p>
            {currentModel.note && (
              <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-red-800 dark:text-red-200 text-xs font-medium">
                  {currentModel.note}
                </p>
              </div>
            )}
            
            {selectedProvider === "huggingface" && (
              <div className="mb-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                <p className="text-orange-800 dark:text-orange-200 text-xs font-medium">
                  ⚠️ <strong>Importante:</strong> Hugging Face Inference API no soporta modelos text-to-video.
                  Para generar video te recomendamos usar el proveedor <strong>Replicate</strong> o <strong>Fal.ai</strong>.
                </p>
              </div>
            )}
            <div className="flex gap-4 pt-2 border-t border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">Calidad:</span>
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  {currentModel.quality}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">Velocidad:</span>
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  {currentModel.speed}
                </span>
              </div>
            </div>
            {currentModel.free && (
              <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                  ✅ {currentModel.freeNote}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
