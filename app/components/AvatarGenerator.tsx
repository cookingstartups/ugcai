"use client";

import { useState } from "react";
import { useToast, ToastContainer } from "./ToastContainer";
import { AvatarGenerationOptions } from "@/lib/huggingface";
import LoadingState from "./LoadingState";
import { saveAvatar, getAllAvatars } from "@/lib/avatarHistory";

// Los mejores modelos de IA gratuitos para imágenes (incluye alternativas sin censura)
const AVAILABLE_MODELS = [
  {
    id: "black-forest-labs/FLUX.1-dev",
    name: "FLUX.1-dev",
    description: "Calidad muy alta - 12B parámetros, fotos estéticas, menos restricciones",
    provider: "Black Forest Labs",
    quality: "Muy alta",
    speed: "Media",
    uncensored: true,
    nsfw: true,
  },
  {
    id: "black-forest-labs/FLUX.1-schnell",
    name: "FLUX.1-schnell",
    description: "Generación rápida - licencia Apache 2.0, menos restricciones",
    provider: "Black Forest Labs",
    quality: "Buena",
    speed: "Muy rápida",
    uncensored: true,
    nsfw: true,
  },
  {
    id: "SG161222/Realistic_Vision_V6.0_B1_noVAE",
    name: "Realistic Vision V6.0",
    description: "Fotos realistas - compatible con NSFW, alta calidad",
    provider: "SG161222",
    quality: "Muy alta",
    speed: "Media",
    uncensored: true,
    nsfw: true,
  },
  {
    id: "SG161222/Realistic_Vision_V5.1_noVAE",
    name: "Realistic Vision V5.1",
    description: "Fotos realistas - compatible con NSFW, versión estable",
    provider: "SG161222",
    quality: "Alta",
    speed: "Media",
    uncensored: true,
    nsfw: true,
  },
  {
    id: "runwayml/stable-diffusion-v1-5",
    name: "Stable Diffusion v1.5",
    description: "Clásico y rápido - amplio uso, compatible con NSFW",
    provider: "Runway",
    quality: "Buena",
    speed: "Rápida",
    uncensored: true,
    nsfw: true,
  },
  {
    id: "CompVis/stable-diffusion-v1-4",
    name: "Stable Diffusion v1.4",
    description: "Modelo original - compatible con NSFW, fiable",
    provider: "CompVis",
    quality: "Buena",
    speed: "Rápida",
    uncensored: true,
    nsfw: true,
  },
  {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    description: "Popular y fiable - imágenes de alta calidad",
    provider: "Stability AI",
    quality: "Alta",
    speed: "Media",
    uncensored: false,
    nsfw: false,
  },
  {
    id: "stabilityai/sdxl-turbo",
    name: "SDXL Turbo",
    description: "Muy rápido - generación de imágenes en un solo paso",
    provider: "Stability AI",
    quality: "Buena",
    speed: "Muy rápida",
    uncensored: false,
    nsfw: false,
  },
];

export default function AvatarGenerator() {
  const [prompt, setPrompt] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [options, setOptions] = useState<AvatarGenerationOptions>({
    style: "realistic",
    gender: undefined,
    age: undefined,
    additionalPrompt: "",
    model: AVAILABLE_MODELS[0].id,
  });
  const { toasts, removeToast, success, error: showError } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showError("Por favor, introduce una descripción");
      return;
    }

    setIsGenerating(true);
    setAvatarUrl(null);

    try {
      const response = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          options: {
            ...options,
            model: selectedModel,
            additionalPrompt: options.additionalPrompt?.trim() || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo generar el avatar");
      }

      setAvatarUrl(data.imageUrl);
      setIsSaved(false); // Reset saved state for new avatar
    } catch (error: any) {
      console.error("Error generating avatar:", error);
      showError(
        error.message || "Ocurrió un error al generar el avatar"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!avatarUrl) return;

    const link = document.createElement("a");
    link.href = avatarUrl;
    link.download = `avatar-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("¡Avatar descargado!");
  };

  const handleSave = () => {
    if (!avatarUrl || !prompt.trim()) {
      showError("Se necesita el avatar y una descripción para guardar");
      return;
    }

    try {
      // Check if already saved
      const allAvatars = getAllAvatars();
      const alreadySaved = allAvatars.some(
        (avatar) => avatar.imageUrl === avatarUrl
      );

      if (alreadySaved) {
        success("¡Este avatar ya está guardado!");
        setIsSaved(true);
        return;
      }

      saveAvatar(avatarUrl, prompt.trim(), selectedModel);
      setIsSaved(true);
      success("¡Avatar guardado correctamente! Ya puedes usarlo en el Generador de Outfits.");
    } catch (error: any) {
      console.error("Error saving avatar:", error);
      showError(error.message || "Ocurrió un error al guardar el avatar");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Generador de Avatares con IA
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Crea avatares personalizados con Hugging Face IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selecciona el modelo de IA
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {AVAILABLE_MODELS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => {
                      const newModel = e.target.value;
                      setSelectedModel(newModel);
                      setOptions({ ...options, model: newModel });
                    }}
                    disabled={isGenerating}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {model.name}
                      </span>
                      {model.uncensored && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded font-medium">
                          ✓ Menos restricciones
                        </span>
                      )}
                      {model.nsfw && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded font-medium">
                          🔞 Compatible con NSFW
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                        {model.provider}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {model.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                      <span>Calidad: {model.quality}</span>
                      <span>Velocidad: {model.speed}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>💡 Consejo:</strong> Los modelos 🔞 compatibles con NSFW (Realistic Vision, FLUX, Stable Diffusion v1.4/v1.5) son adecuados para generar imágenes con desnudez.
                Se pueden usar de forma gratuita a través de Hugging Face Inference API (con API key obtienes límites más altos).
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="avatar-prompt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Descripción del avatar
            </label>
            <textarea
              id="avatar-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              placeholder="Ej: Una mujer joven, cabello castaño, sonriendo, aspecto profesional..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {prompt.length} / 500 caracteres
            </p>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estilo
            </label>
            <select
              value={options.style}
              onChange={(e) =>
                setOptions({
                  ...options,
                  style: e.target.value as AvatarGenerationOptions["style"],
                })
              }
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="realistic">Realista</option>
              <option value="cartoon">Caricatura</option>
              <option value="anime">Anime</option>
              <option value="professional">Profesional</option>
              <option value="artistic">Artístico</option>
            </select>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Género (opcional)
            </label>
            <select
              value={options.gender || ""}
              onChange={(e) =>
                setOptions({
                  ...options,
                  gender: e.target.value
                    ? (e.target.value as AvatarGenerationOptions["gender"])
                    : undefined,
                })
              }
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Sin especificar</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="neutral">Neutro</option>
            </select>
          </div>

          {/* Age Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Edad (opcional)
            </label>
            <select
              value={options.age || ""}
              onChange={(e) =>
                setOptions({
                  ...options,
                  age: e.target.value
                    ? (e.target.value as AvatarGenerationOptions["age"])
                    : undefined,
                })
              }
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Sin especificar</option>
              <option value="young">Joven</option>
              <option value="adult">Adulto/a</option>
              <option value="elderly">Mayor</option>
            </select>
          </div>

          {/* Additional Prompt */}
          <div>
            <label
              htmlFor="additional-prompt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Detalles adicionales (opcional)
            </label>
            <input
              id="additional-prompt"
              type="text"
              value={options.additionalPrompt || ""}
              onChange={(e) =>
                setOptions({ ...options, additionalPrompt: e.target.value })
              }
              disabled={isGenerating}
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Ej: ojos azules, cabello corto, gafas de sol..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isGenerating ? "Generando..." : "Generar avatar"}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          {isGenerating && (
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <LoadingState 
                status={{
                  status: "generating-video",
                  message: "Generando avatar...",
                  progress: undefined,
                }}
              />
            </div>
          )}

          {!isGenerating && avatarUrl && (
            <div className="space-y-4">
              <div className="relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <img
                  src={avatarUrl}
                  alt="Generated avatar"
                  className="w-full h-auto rounded-lg shadow-md"
                />
                {isSaved && (
                  <div className="absolute top-6 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <span>✓</span>
                    <span>Guardado</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                    isSaved
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                  }`}
                >
                  {isSaved ? "✓ Guardado" : "💾 Guardar"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  📥 Descargar
                </button>
              </div>
              {isSaved && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>✓ ¡Guardado!</strong> Avatar guardado. Ahora puedes seleccionar este personaje en la sección "Generador de Outfits" y vestirlo.
                  </p>
                </div>
              )}
            </div>
          )}

          {!isGenerating && !avatarUrl && (
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 border-dashed">
              <div className="text-center text-gray-400 dark:text-gray-500">
                <svg
                  className="mx-auto h-16 w-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-lg font-medium">El avatar aparecerá aquí</p>
                <p className="text-sm mt-2">
                  Rellena el formulario de arriba y pulsa "Generar avatar"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Consejo:</strong> Para mejores resultados, escribe una descripción detallada.
          Por ejemplo: "Una mujer joven, cabello castaño, ojos azules,
          sonriendo, ropa de trabajo profesional, iluminación de estudio"
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
          <strong>Nota:</strong> La API key de Hugging Face se puede añadir al archivo .env
          como HUGGINGFACE_API_KEY (opcional, el nivel gratuito está disponible)
        </p>
      </div>
    </div>
  );
}
