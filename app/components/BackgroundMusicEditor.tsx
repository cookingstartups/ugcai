"use client";

import { useState } from "react";
import { BackgroundMusicOptions } from "@/lib/audio";

interface BackgroundMusicEditorProps {
  videoUrl: string;
  onSave?: (options: BackgroundMusicOptions, musicFile: File | null) => void;
  onCancel?: () => void;
}

export default function BackgroundMusicEditor({
  videoUrl,
  onSave,
  onCancel,
}: BackgroundMusicEditorProps) {
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<BackgroundMusicOptions>({
    volume: 0.3, // 30% volume by default
    fadeIn: 1,
    fadeOut: 1,
    loop: false,
    startTime: 0,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setMusicFile(file);
      const url = URL.createObjectURL(file);
      setMusicUrl(url);
    } else {
      alert("Por favor, selecciona un archivo de audio válido (MP3, WAV, OGG, etc.)");
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(options, musicFile);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Música de fondo
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
          <button
            onClick={handleSave}
            disabled={!musicFile}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Music File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Archivo de música
        </label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/20 dark:file:text-purple-300"
        />
        {musicFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Archivo seleccionado: {musicFile.name} ({(musicFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        {musicUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vista previa:
            </p>
            <audio controls src={musicUrl} className="w-full">
              Tu navegador no admite la reproducción de audio.
            </audio>
          </div>
        )}
      </div>

      {/* Music Options */}
      <div className="space-y-4">
        {/* Volume Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Volumen de música: {Math.round(options.volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={options.volume}
            onChange={(e) =>
              setOptions({ ...options, volume: Number(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            💡 Recomendación: El volumen de la música debe estar entre el 20-30% para que la voz quede en primer plano.
          </p>
        </div>

        {/* Fade In */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fade In (segundos): {options.fadeIn || 0}s
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={options.fadeIn || 0}
            onChange={(e) =>
              setOptions({ ...options, fadeIn: Number(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        {/* Fade Out */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fade Out (segundos): {options.fadeOut || 0}s
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={options.fadeOut || 0}
            onChange={(e) =>
              setOptions({ ...options, fadeOut: Number(e.target.value) })
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        {/* Loop */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="loop"
            checked={options.loop || false}
            onChange={(e) =>
              setOptions({ ...options, loop: e.target.checked })
            }
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label
            htmlFor="loop"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Reproducir música en bucle (repetir hasta que termine el video)
          </label>
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tiempo de inicio (segundos): {options.startTime || 0}s
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={options.startTime || 0}
            onChange={(e) =>
              setOptions({ ...options, startTime: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Indica en qué segundo del video comenzará la música.
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Consejo:</strong> El archivo de música puede estar en formato MP3, WAV u OGG.
          Mantén el volumen bajo para que la voz se escuche con claridad.
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
          <strong>Nota:</strong> Esta función requiere procesamiento de video con FFmpeg.
          Añadir música puede tardar un momento.
        </p>
      </div>
    </div>
  );
}
