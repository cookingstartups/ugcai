"use client";

import { useState } from "react";

interface VideoFormatConverterProps {
  videoUrl: string;
  onSave?: (convertedUrl: string, format: string) => void;
  onCancel?: () => void;
}

export default function VideoFormatConverter({
  videoUrl,
  onSave,
  onCancel,
}: VideoFormatConverterProps) {
  const [selectedFormat, setSelectedFormat] = useState<"mp4" | "webm" | "gif" | "mov">("mp4");
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    setProcessing(true);
    setProgress(0);

    try {
      const response = await fetch("/api/convert-video-format", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          format: selectedFormat,
          quality,
        }),
      });

      const data = await response.json();

      if (data.success && data.videoUrl) {
        setConvertedUrl(data.videoUrl);
      } else {
        alert("No se pudo convertir el video: " + (data.error || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error converting video:", error);
      alert("Ocurrió un error al convertir el video: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl) return;

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `converted-video-${Date.now()}.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    if (onSave && convertedUrl) {
      onSave(convertedUrl, selectedFormat);
    }
  };

  const formats = [
    { value: "mp4" as const, name: "MP4", description: "Formato más común, compatible con todas las plataformas", icon: "🎬" },
    { value: "webm" as const, name: "WebM", description: "Optimizado para la web, tamaño de archivo reducido", icon: "🌐" },
    { value: "gif" as const, name: "GIF", description: "Imagen animada, ideal para redes sociales", icon: "🖼️" },
    { value: "mov" as const, name: "MOV", description: "Formato Apple, alta calidad", icon: "🍎" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Conversor de formato de video
        </h2>
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          )}
          {onSave && convertedUrl && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Guardar
            </button>
          )}
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Selección de formato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formats.map((format) => (
            <button
              key={format.value}
              onClick={() => setSelectedFormat(format.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedFormat === format.value
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{format.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {format.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {format.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Kalite
        </h3>
        <div className="flex gap-2">
          {[
            { value: "low" as const, name: "Baja", description: "Archivo pequeño, procesamiento rápido" },
            { value: "medium" as const, name: "Media", description: "Equilibrio entre calidad y tamaño" },
            { value: "high" as const, name: "Alta", description: "Mejor calidad, archivo grande" },
          ].map((q) => (
            <button
              key={q.value}
              onClick={() => setQuality(q.value)}
              className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                quality === q.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">{q.name}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{q.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Convert Button */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleConvert}
          disabled={processing}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {processing ? `Convirtiendo... ${Math.round(progress)}%` : `Convertir (${selectedFormat.toUpperCase()})`}
        </button>
        {convertedUrl && (
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            📥 Descargar
          </button>
        )}
      </div>

      {/* Progress */}
      {processing && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Converted Video Preview */}
      {convertedUrl && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
            Video convertido ({selectedFormat.toUpperCase()})
          </h4>
          {selectedFormat === "gif" ? (
            <img
              src={convertedUrl}
              alt="Converted GIF"
              className="w-full rounded-lg"
            />
          ) : (
            <video
              src={convertedUrl}
              controls
              className="w-full rounded-lg"
            >
              Tu navegador no soporta reproducción de video.
            </video>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Consejo:</strong> La conversión a GIF puede tardar más tiempo.
          El formato WebM es el más optimizado para sitios web.
        </p>
      </div>
    </div>
  );
}
