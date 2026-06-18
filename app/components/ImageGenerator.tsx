"use client";

import { useState, useEffect } from "react";
import { useToast, ToastContainer } from "./ToastContainer";
import { ImageGenerationOptions } from "@/lib/huggingface";
import LoadingState from "./LoadingState";
import { getAllAvatars, SavedAvatar } from "@/lib/avatarHistory";

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
    id: "SG161222/Realistic_Vision_V5.1_noVAE",
    name: "Realistic Vision V5.1",
    description: "Fotos realistas - compatible con NSFW, versión estable (compatible con Inference API)",
    provider: "SG161222",
    quality: "Alta",
    speed: "Media",
    uncensored: true,
    nsfw: true,
  },
  {
    id: "SG161222/Realistic_Vision_V6.0_B1_noVAE",
    name: "Realistic Vision V6.0",
    description: "Fotos realistas - compatible con NSFW, alta calidad (Nota: soporte Inference API limitado, se recomienda V5.1)",
    provider: "SG161222",
    quality: "Muy alta",
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

const ASPECT_RATIOS = [
  { value: "9:16" as const, name: "Vertical (9:16)", description: "Instagram Story, TikTok, YouTube Shorts", width: 1080, height: 1920 },
  { value: "1:1" as const, name: "Cuadrado (1:1)", description: "Instagram Post", width: 1024, height: 1024 },
  { value: "16:9" as const, name: "Horizontal (16:9)", description: "YouTube, Facebook", width: 1920, height: 1080 },
  { value: "4:3" as const, name: "Clásico (4:3)", description: "Formato tradicional", width: 1024, height: 768 },
  { value: "21:9" as const, name: "Ultra ancho (21:9)", description: "Cinematográfico", width: 2560, height: 1080 },
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<"1:1" | "4:3" | "16:9" | "9:16" | "21:9">("9:16");
  const [style, setStyle] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [savedAvatars, setSavedAvatars] = useState<SavedAvatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<SavedAvatar | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [poseVariationImage, setPoseVariationImage] = useState<string | null>(null);
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);
  const [selectedPose, setSelectedPose] = useState("");
  const [selectedCameraAngle, setSelectedCameraAngle] = useState("");
  const [poseStrength, setPoseStrength] = useState(0.7);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    // Load saved avatars
    const avatars = getAllAvatars();
    setSavedAvatars(avatars);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedAvatar) {
      showError("Por favor, introduce una descripción o selecciona un avatar");
      return;
    }

    setIsGenerating(true);
    setImageUrl(null);

    try {
      // Build prompt with avatar reference if selected
      let finalPrompt = prompt.trim();
      
      if (selectedAvatar) {
        // Add avatar description to prompt
        finalPrompt = `${finalPrompt ? finalPrompt + ", " : ""}based on avatar: ${selectedAvatar.prompt}, same character, consistent style`;
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt || selectedAvatar?.prompt || "",
          options: {
            model: selectedModel,
            aspectRatio: selectedAspectRatio,
            style: style.trim() || undefined,
            additionalPrompt: additionalPrompt.trim() || undefined,
            avatarImageUrl: selectedAvatar?.imageUrl, // Pass avatar image for reference
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo generar la imagen");
      }

      setImageUrl(data.imageUrl);
      success("¡Imagen generada correctamente!");
    } catch (error: any) {
      console.error("Error generating image:", error);
      showError(error.message || "Ocurrió un error al generar la imagen");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("¡Imagen descargada!");
  };

  const handleGeneratePoseVariation = async () => {
    if (!imageUrl) {
      showError("Por favor, genera primero una imagen");
      return;
    }

    if (!selectedPose && !selectedCameraAngle) {
      showError("Por favor, selecciona al menos una pose o un ángulo de cámara");
      return;
    }

    setIsGeneratingPose(true);
    setPoseVariationImage(null);

    try {
      // Build prompt for pose variation
      let posePrompt = prompt || "same character";
      if (selectedPose) {
        posePrompt = `${posePrompt}, ${selectedPose}`;
      }
      if (selectedCameraAngle) {
        posePrompt = `${posePrompt}, ${selectedCameraAngle} camera angle`;
      }

      const response = await fetch("/api/generate-pose-variation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceImageUrl: imageUrl,
          prompt: posePrompt,
          options: {
            pose: selectedPose || undefined,
            cameraAngle: selectedCameraAngle || undefined,
            strength: poseStrength,
            aspectRatio: selectedAspectRatio,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo generar la variación de pose");
      }

      setPoseVariationImage(data.imageUrl);
      success("¡Variación de pose generada correctamente!");
    } catch (error: any) {
      console.error("Error generating pose variation:", error);
      showError(error.message || "Ocurrió un error al generar la variación de pose");
    } finally {
      setIsGeneratingPose(false);
    }
  };

  const handleDownloadPoseVariation = () => {
    if (!poseVariationImage) return;

    const link = document.createElement("a");
    link.href = poseVariationImage;
    link.download = `pose-variation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("¡Variación de pose descargada!");
  };

  const selectedAspectRatioInfo = ASPECT_RATIOS.find(r => r.value === selectedAspectRatio);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Generador de imágenes con IA
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Genera imágenes en formato vertical, horizontal o cuadrado con Hugging Face IA
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
            <div className="space-y-2 max-h-64 overflow-y-auto">
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
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isGenerating}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
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
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {model.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Formato / Relación de aspecto
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => !isGenerating && setSelectedAspectRatio(ratio.value)}
                  disabled={isGenerating}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    selectedAspectRatio === ratio.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {ratio.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {ratio.description}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {ratio.width} × {ratio.height}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Selector */}
          {savedAvatars.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Usar avatar guardado (opcional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {showAvatarSelector ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {showAvatarSelector && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAvatar(null)}
                      className={`p-2 border-2 rounded-lg text-xs transition-all ${
                        !selectedAvatar
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                      }`}
                    >
                      Sin avatar
                    </button>
                    {savedAvatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`p-2 border-2 rounded-lg transition-all ${
                          selectedAvatar?.id === avatar.id
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                        }`}
                      >
                        <img
                          src={avatar.imageUrl}
                          alt={avatar.prompt.substring(0, 30)}
                          className="w-full h-20 object-cover rounded mb-1"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                          {avatar.prompt.substring(0, 25)}...
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selectedAvatar && (
                <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedAvatar.imageUrl}
                      alt="Selected avatar"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Avatar seleccionado
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {selectedAvatar.prompt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAvatar(null)}
                      className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción de la imagen {selectedAvatar ? "(Opcional - se usa avatar)" : "*"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selectedAvatar
                ? "Añade detalles adicionales (opcional) - ya se usa el avatar"
                : "Ej: A beautiful sunset over mountains, cinematic lighting, vibrant colors"}
              rows={4}
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Style Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estilo (opcional)
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Ej: realistic, cartoon, anime, professional, artistic"
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Additional Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detalles adicionales (opcional)
            </label>
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder="Ej: high quality, 8k, detailed, professional photography"
              rows={2}
              disabled={isGenerating}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isGenerating ? "Generando imagen..." : "Generar imagen"}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          {isGenerating && (
            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <LoadingState
                status={{
                  status: "generating-video",
                  message: "Generando imagen...",
                  progress: undefined,
                }}
              />
            </div>
          )}

          {imageUrl && !isGenerating && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Generated"
                  className={`w-full object-contain ${
                    selectedAspectRatio === "9:16" ? "max-h-[600px]" : "max-h-[500px]"
                  }`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📥 Descargar
                </button>
                <button
                  onClick={() => setImageUrl(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ✕ Limpiar
                </button>
              </div>
              {selectedAspectRatioInfo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Format:</strong> {selectedAspectRatioInfo.name} ({selectedAspectRatioInfo.width} × {selectedAspectRatioInfo.height}px)
                  </p>
                </div>
              )}

              {/* Pose Variation Section */}
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🎭 Variaciones de pose y ángulo de cámara
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Genera distintas poses y ángulos de cámara desde la imagen creada
                </p>

                <div className="space-y-4">
                  {/* Pose Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selecciona una pose
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        "front view",
                        "side view",
                        "back view",
                        "three-quarter view",
                        "profile view",
                        "looking up",
                        "looking down",
                        "looking left",
                        "looking right",
                      ].map((pose) => (
                        <button
                          key={pose}
                          type="button"
                          onClick={() => setSelectedPose(selectedPose === pose ? "" : pose)}
                          disabled={isGeneratingPose}
                          className={`p-2 text-xs border-2 rounded-lg transition-all ${
                            selectedPose === pose
                              ? "border-purple-600 bg-purple-100 dark:bg-purple-900/30"
                              : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                          } ${isGeneratingPose ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {pose}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Camera Angle Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ángulo de cámara
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        "low angle",
                        "high angle",
                        "eye level",
                        "bird's eye view",
                        "worm's eye view",
                        "dutch angle",
                      ].map((angle) => (
                        <button
                          key={angle}
                          type="button"
                          onClick={() => setSelectedCameraAngle(selectedCameraAngle === angle ? "" : angle)}
                          disabled={isGeneratingPose}
                          className={`p-2 text-xs border-2 rounded-lg transition-all ${
                            selectedCameraAngle === angle
                              ? "border-purple-600 bg-purple-100 dark:bg-purple-900/30"
                              : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                          } ${isGeneratingPose ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {angle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strength Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Intensidad del cambio: {Math.round(poseStrength * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="1.0"
                      step="0.1"
                      value={poseStrength}
                      onChange={(e) => setPoseStrength(parseFloat(e.target.value))}
                      disabled={isGeneratingPose}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Poco cambio</span>
                      <span>Mucho cambio</span>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGeneratePoseVariation}
                    disabled={isGeneratingPose || (!selectedPose && !selectedCameraAngle)}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isGeneratingPose ? "Generando variación de pose..." : "Generar variación de pose"}
                  </button>
                </div>

                {/* Pose Variation Result */}
                {isGeneratingPose && (
                  <div className="mt-4 flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <LoadingState
                      status={{
                        status: "generating-video",
                        message: "Generando variación de pose...",
                        progress: undefined,
                      }}
                    />
                  </div>
                )}

                {poseVariationImage && !isGeneratingPose && (
                  <div className="mt-4 space-y-4">
                    <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={poseVariationImage}
                        alt="Pose Variation"
                        className={`w-full object-contain ${
                          selectedAspectRatio === "9:16" ? "max-h-[600px]" : "max-h-[500px]"
                        }`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDownloadPoseVariation}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        📥 Descargar variación de pose
                      </button>
                      <button
                        onClick={() => {
                          setPoseVariationImage(null);
                          setSelectedPose("");
                          setSelectedCameraAngle("");
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        ✕ Limpiar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!imageUrl && !isGenerating && (
            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🎨</div>
                <p>La imagen aparecerá aquí</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Consejo:</strong> El formato vertical (9:16) es ideal para Instagram Story, TikTok y YouTube Shorts.
          Los modelos FLUX tienen menos restricciones de contenido y generan imágenes de alta calidad.
        </p>
      </div>
    </div>
  );
}
