"use client";

import { useState } from "react";

interface VideoEffectsEditorProps {
  videoUrl: string;
  onSave?: (filteredUrl: string, effects: VideoEffects) => void;
  onCancel?: () => void;
}

export interface VideoEffects {
  filter?: {
    type: "brightness" | "contrast" | "saturation" | "blur" | "sharpen" | "vintage" | "blackwhite" | "sepia";
    intensity: number;
  };
  speed?: number;
}

export default function VideoEffectsEditor({
  videoUrl,
  onSave,
  onCancel,
}: VideoEffectsEditorProps) {
  const [effects, setEffects] = useState<VideoEffects>({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleApplyFilter = async () => {
    if (!effects.filter) return;

    setProcessing(true);
    setProgress(0);

    try {
      const response = await fetch("/api/apply-video-filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          filter: effects.filter.type,
          intensity: effects.filter.intensity,
        }),
      });

      const data = await response.json();

      if (data.success && data.videoUrl) {
        setPreviewUrl(data.videoUrl);
      } else {
        alert("No se pudo aplicar el filtro: " + (data.error || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error applying filter:", error);
      alert("Ocurrió un error al aplicar el filtro: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleChangeSpeed = async () => {
    if (!effects.speed) return;

    setProcessing(true);
    setProgress(0);

    try {
      const response = await fetch("/api/change-video-speed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          speed: effects.speed,
        }),
      });

      const data = await response.json();

      if (data.success && data.videoUrl) {
        setPreviewUrl(data.videoUrl);
      } else {
        alert("No se pudo cambiar la velocidad: " + (data.error || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error changing speed:", error);
      alert("Ocurrió un error al cambiar la velocidad: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = () => {
    if (onSave && previewUrl) {
      onSave(previewUrl, effects);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Efectos de video
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
          {onSave && previewUrl && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Guardar
            </button>
          )}
        </div>
      </div>

      {/* Video Filters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filtreler
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { type: "brightness" as const, name: "Brillo", icon: "☀️" },
            { type: "contrast" as const, name: "Contraste", icon: "🎨" },
            { type: "saturation" as const, name: "Saturación", icon: "🌈" },
            { type: "blur" as const, name: "Desenfoque", icon: "🌫️" },
            { type: "sharpen" as const, name: "Nitidez", icon: "✨" },
            { type: "vintage" as const, name: "Vintage", icon: "📷" },
            { type: "blackwhite" as const, name: "Blanco y negro", icon: "⚫" },
            { type: "sepia" as const, name: "Sepia", icon: "🟤" },
          ].map((filter) => (
            <button
              key={filter.type}
              onClick={() =>
                setEffects({
                  ...effects,
                  filter: {
                    type: filter.type,
                    intensity: effects.filter?.type === filter.type ? effects.filter.intensity : 50,
                  },
                })
              }
              className={`p-4 border-2 rounded-lg transition-all ${
                effects.filter?.type === filter.type
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
              }`}
            >
              <div className="text-2xl mb-2">{filter.icon}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {filter.name}
              </div>
            </button>
          ))}
        </div>

        {effects.filter && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intensidad: {effects.filter.intensity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={effects.filter.intensity}
              onChange={(e) =>
                setEffects({
                  ...effects,
                  filter: {
                    ...effects.filter!,
                    intensity: Number(e.target.value),
                  },
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
            />
            <button
              onClick={handleApplyFilter}
              disabled={processing}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? `Procesando... ${Math.round(progress)}%` : "Aplicar filtro"}
            </button>
          </div>
        )}
      </div>

      {/* Video Speed */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Control de velocidad
        </h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Velocidad: {effects.speed ? `${effects.speed}x` : "1x"} (Normal)
          </label>
          <div className="flex gap-2 mb-4">
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setEffects({ ...effects, speed })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  effects.speed === speed
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                }`}
              >
                {speed === 1 ? "1x" : speed < 1 ? `${speed}x (Lento)` : `${speed}x (Rápido)`}
              </button>
            ))}
          </div>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={effects.speed || 1}
            onChange={(e) =>
              setEffects({ ...effects, speed: Number(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
          <button
            onClick={handleChangeSpeed}
            disabled={processing || !effects.speed || effects.speed === 1}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? `Procesando... ${Math.round(progress)}%` : "Cambiar velocidad"}
          </button>
        </div>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
            Vista previa
          </h4>
          <video
            src={previewUrl}
            controls
            className="w-full rounded-lg"
          >
            Tu navegador no soporta reproducción de video.
          </video>
        </div>
      )}

      {processing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
