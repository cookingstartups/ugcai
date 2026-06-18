"use client";

import { useState, useEffect } from "react";

interface VideoCompressorProps {
  videoUrl: string;
  onSave?: (compressedUrl: string, compression: CompressionOptions) => void;
  onCancel?: () => void;
}

export interface CompressionOptions {
  quality: "low" | "medium" | "high";
  targetSizeMB?: number;
}

export default function VideoCompressor({
  videoUrl,
  onSave,
  onCancel,
}: VideoCompressorProps) {
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [targetSizeMB, setTargetSizeMB] = useState<number | undefined>(undefined);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  // Get original video size
  useEffect(() => {
    if (videoUrl.startsWith("data:")) {
      // For data URLs, calculate size from base64
      const base64 = videoUrl.split(",")[1];
      if (base64) {
        const size = (base64.length * 3) / 4;
        setOriginalSize(size);
      }
    } else {
      fetch(videoUrl)
        .then((res) => {
          const contentLength = res.headers.get("content-length");
          if (contentLength) {
            setOriginalSize(parseInt(contentLength));
          }
        })
        .catch(() => {});
    }
  }, [videoUrl]);

  const handleCompress = async () => {
    setProcessing(true);
    setProgress(0);

    try {
      const response = await fetch("/api/compress-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          quality,
          targetSizeMB,
        }),
      });

      const data = await response.json();

      if (data.success && data.videoUrl) {
        setCompressedUrl(data.videoUrl);
        
        // Calculate compressed size
        if (data.videoUrl.startsWith("data:")) {
          const base64 = data.videoUrl.split(",")[1];
          const size = (base64.length * 3) / 4; // Approximate size
          setCompressedSize(size);
        }
      } else {
        alert("No se pudo comprimir el video: " + (data.error || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error compressing video:", error);
      alert("Ocurrió un error al comprimir el video: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl) return;

    const link = document.createElement("a");
    link.href = compressedUrl;
    link.download = `compressed-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    if (onSave && compressedUrl) {
      onSave(compressedUrl, { quality, targetSizeMB });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Desconocido";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const compressionRatio = originalSize && compressedSize
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Compresor de video
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
          {onSave && compressedUrl && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Guardar
            </button>
          )}
        </div>
      </div>

      {/* File Size Info */}
      {originalSize && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Tamaño original
              </p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                {formatFileSize(originalSize)}
              </p>
            </div>
            {compressedSize && (
              <>
                <div className="text-2xl text-blue-600">→</div>
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-200">
                    Comprimido
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-200">
                    {formatFileSize(compressedSize)}
                  </p>
                  {compressionRatio && (
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {compressionRatio}% reducido
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quality Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nivel de calidad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              value: "low" as const,
              name: "Baja",
              description: "Archivo más pequeño, procesamiento rápido",
              crf: "32",
              scale: "1280x720",
            },
            {
              value: "medium" as const,
              name: "Media",
              description: "Equilibrio entre calidad y tamaño",
              crf: "28",
              scale: "1920x1080",
            },
            {
              value: "high" as const,
              name: "Alta",
              description: "Buena calidad, tamaño moderado",
              crf: "23",
              scale: "Original",
            },
          ].map((q) => (
            <button
              key={q.value}
              onClick={() => setQuality(q.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                quality === q.value
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {q.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {q.description}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                CRF: {q.crf} | Resolución: {q.scale}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Target Size (Optional) */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tamaño de archivo objetivo (opcional)
        </h3>
        <div className="flex gap-4 items-center">
          <input
            type="number"
            min="1"
            max="1000"
            value={targetSizeMB || ""}
            onChange={(e) =>
              setTargetSizeMB(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="Tamaño objetivo en MB"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => setTargetSizeMB(undefined)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Limpiar
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Si se indica, el video se comprimirá aproximadamente a ese tamaño
        </p>
      </div>

      {/* Compress Button */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleCompress}
          disabled={processing}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {processing ? `Comprimiendo... ${Math.round(progress)}%` : "Comprimir video"}
        </button>
        {compressedUrl && (
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

      {/* Compressed Video Preview */}
      {compressedUrl && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
            Video comprimido
          </h4>
          <video
            src={compressedUrl}
            controls
            className="w-full rounded-lg"
          >
            Tu navegador no soporta reproducción de video.
          </video>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Consejo:</strong> La calidad baja produce el archivo más pequeño pero reduce la calidad visual.
          La calidad media suele ofrecer el mejor equilibrio.
        </p>
      </div>
    </div>
  );
}
