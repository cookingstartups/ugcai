"use client";

import { useState, useEffect } from "react";
import { useToast, ToastContainer } from "./ToastContainer";
import LoadingState from "./LoadingState";
import { getAllAvatars, SavedAvatar } from "@/lib/avatarHistory";

interface OutfitOptions {
  clothingType: string;
  color?: string;
  style?: string;
  brand?: string;
  additionalDetails?: string;
}

export default function CharacterOutfitGenerator() {
  const [selectedAvatar, setSelectedAvatar] = useState<SavedAvatar | null>(null);
  const [outfitOptions, setOutfitOptions] = useState<OutfitOptions>({
    clothingType: "",
    color: "",
    style: "",
    brand: "",
    additionalDetails: "",
  });
  const [savedAvatars, setSavedAvatars] = useState<SavedAvatar[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    // Load saved avatars
    const avatars = getAllAvatars();
    setSavedAvatars(avatars);
  }, []);

  const clothingTypes = [
    { value: "lingerie", name: "Lencería", icon: "👙" },
    { value: "underwear", name: "Ropa interior", icon: "🩲" },
    { value: "bra", name: "Sujetador", icon: "👗" },
    { value: "swimwear", name: "Bañador/Bikini", icon: "🏖️" },
    { value: "sportswear", name: "Ropa deportiva", icon: "🏃" },
    { value: "casual", name: "Ropa casual", icon: "👕" },
    { value: "formal", name: "Ropa formal", icon: "👔" },
    { value: "dress", name: "Vestido", icon: "👗" },
  ];

  const colors = [
    "Negro", "Blanco", "Rojo", "Azul", "Verde", "Rosa", "Morado", "Naranja",
    "Amarillo", "Marrón", "Gris", "Marino", "Turquesa", "Dorado", "Plateado"
  ];

  const styles = [
    "Clásico", "Moderno", "Sexy", "Cómodo", "Elegante", "Deportivo", "Vintage", "Minimalista",
    "Llamativo", "Refinado", "Casual", "Sofisticado"
  ];

  const handleGenerate = async () => {
    if (!selectedAvatar) {
      showError("Por favor, selecciona un avatar de personaje");
      return;
    }

    if (!outfitOptions.clothingType) {
      showError("Por favor, selecciona un tipo de ropa");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Build detailed prompt for outfit
      let prompt = `${selectedAvatar.prompt}, wearing ${outfitOptions.clothingType}`;
      
      if (outfitOptions.color) {
        prompt += `, ${outfitOptions.color.toLowerCase()} color`;
      }
      
      if (outfitOptions.style) {
        prompt += `, ${outfitOptions.style.toLowerCase()} style`;
      }
      
      if (outfitOptions.brand) {
        prompt += `, ${outfitOptions.brand} brand`;
      }
      
      if (outfitOptions.additionalDetails) {
        prompt += `, ${outfitOptions.additionalDetails}`;
      }

      // Add outfit-specific keywords
      prompt += ", full body, professional photography, high quality, detailed clothing, fashion photography";

      // Determine dimensions based on format
      let width = 1080;
      let height = 1920;
      if (selectedFormat === "1:1") {
        width = 1024;
        height = 1024;
      } else if (selectedFormat === "16:9") {
        width = 1920;
        height = 1080;
      }

      // Use NSFW-friendly models for outfit generation
      const nsfwModels = [
        "SG161222/Realistic_Vision_V6.0_B1_noVAE",
        "SG161222/Realistic_Vision_V5.1_noVAE",
        "black-forest-labs/FLUX.1-dev",
        "runwayml/stable-diffusion-v1-5",
      ];
      const selectedModel = nsfwModels[0]; // Use Realistic Vision for best NSFW results

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          options: {
            model: selectedModel,
            aspectRatio: selectedFormat === "9:16" ? "9:16" : selectedFormat === "1:1" ? "1:1" : "16:9",
            width: width,
            height: height,
            avatarImageUrl: selectedAvatar.imageUrl, // Reference the avatar
            additionalPrompt: "same character, consistent face and body, wearing the specified outfit, professional fashion photography, high quality, detailed",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo generar la imagen");
      }

      setGeneratedImage(data.imageUrl);
      success("¡Imagen con outfit generada correctamente!");
    } catch (error: any) {
      console.error("Error generating outfit image:", error);
      showError(error.message || "Ocurrió un error al generar la imagen");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `outfit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("¡Imagen descargada!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Generador de outfits para personajes
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Viste a tu personaje creado con IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selecciona el avatar del personaje *
            </label>
            {savedAvatars.length === 0 ? (
              <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Aún no hay avatares guardados. Primero crea un avatar en el Generador de Avatares.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {savedAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
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
                      className="w-full h-24 object-cover rounded mb-1"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {avatar.prompt.substring(0, 20)}...
                    </p>
                  </button>
                ))}
              </div>
            )}
            {selectedAvatar && (
              <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAvatar.imageUrl}
                    alt="Selected avatar"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Personaje seleccionado
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedAvatar.prompt}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clothing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de ropa *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {clothingTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setOutfitOptions({ ...outfitOptions, clothingType: type.value })
                  }
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    outfitOptions.clothingType === type.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {type.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color (opcional)
            </label>
            <select
              value={outfitOptions.color || ""}
              onChange={(e) =>
                setOutfitOptions({ ...outfitOptions, color: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona un color</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estilo (opcional)
            </label>
            <select
              value={outfitOptions.style || ""}
              onChange={(e) =>
                setOutfitOptions({ ...outfitOptions, style: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona un estilo</option>
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marca (opcional)
            </label>
            <input
              type="text"
              value={outfitOptions.brand || ""}
              onChange={(e) =>
                setOutfitOptions({ ...outfitOptions, brand: e.target.value })
              }
              placeholder="Ej: Victoria's Secret, Calvin Klein"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detalles adicionales (opcional)
            </label>
            <textarea
              value={outfitOptions.additionalDetails || ""}
              onChange={(e) =>
                setOutfitOptions({ ...outfitOptions, additionalDetails: e.target.value })
              }
              placeholder="Ej: detalles de encaje, estampado floral, tejido transparente"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato
            </label>
            <div className="flex gap-2">
              {[
                { value: "9:16" as const, name: "Vertical", desc: "1080×1920" },
                { value: "1:1" as const, name: "Cuadrado", desc: "1024×1024" },
                { value: "16:9" as const, name: "Horizontal", desc: "1920×1080" },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`flex-1 px-4 py-2 border-2 rounded-lg transition-all ${
                    selectedFormat === format.value
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {format.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedAvatar || !outfitOptions.clothingType}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isGenerating ? "Generando imagen..." : "Generar imagen con outfit"}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          {isGenerating && (
            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <LoadingState
                status={{
                  status: "generating-video",
                  message: "Generando imagen con outfit...",
                  progress: undefined,
                }}
              />
            </div>
          )}

          {generatedImage && !isGenerating && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={generatedImage}
                  alt="Generated outfit"
                  className={`w-full object-contain ${
                    selectedFormat === "9:16" ? "max-h-[600px]" : "max-h-[500px]"
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
                  onClick={() => setGeneratedImage(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ✕ Limpiar
                </button>
              </div>
            </div>
          )}

          {!generatedImage && !isGenerating && (
            <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">👗</div>
                <p>La imagen con outfit aparecerá aquí</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Consejo:</strong> Primero crea un personaje en el Generador de Avatares.
          Luego selecciónalo, elige el tipo de ropa, color y estilo que desees.
          La IA generará al mismo personaje con el outfit indicado.
        </p>
      </div>
    </div>
  );
}
