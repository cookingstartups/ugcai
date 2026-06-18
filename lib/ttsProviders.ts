/**
 * TTS Provider configurations and utilities
 */

import { TTSProvider, TTSProviderConfig } from "@/types";

export const TTS_PROVIDERS: TTSProviderConfig[] = [
  {
    provider: "elevenlabs",
    name: "ElevenLabs",
    description: "Síntesis de voz con IA de alta calidad",
    icon: "🎙️",
    isFree: false,
    requiresApiKey: true,
    apiKeyEnv: "ELEVENLABS_API_KEY",
  },
  {
    provider: "edgetts",
    name: "Edge TTS",
    description: "Microsoft Edge TTS - Completamente gratis, sin límites",
    icon: "🌐",
    isFree: true,
    freeLimit: "Ilimitado",
    requiresApiKey: false,
  },
  {
    provider: "google",
    name: "Google Cloud TTS",
    description: "1-4 millones de caracteres gratis al mes",
    icon: "🔊",
    isFree: true,
    freeLimit: "1-4M caracteres/mes",
    requiresApiKey: true,
    apiKeyEnv: "GOOGLE_TTS_API_KEY",
  },
  {
    provider: "azure",
    name: "Azure Speech",
    description: "500.000 caracteres gratis al mes",
    icon: "☁️",
    isFree: true,
    freeLimit: "500K caracteres/mes",
    requiresApiKey: true,
    apiKeyEnv: "AZURE_SPEECH_KEY",
  },
];

export function getTTSProvider(provider: TTSProvider): TTSProviderConfig | undefined {
  return TTS_PROVIDERS.find((p) => p.provider === provider);
}

export function isTTSProviderAvailable(provider: TTSProvider): boolean {
  const config = getTTSProvider(provider);
  if (!config) return false;

  if (!config.requiresApiKey) return true;

  if (config.apiKeyEnv) {
    return !!process.env[config.apiKeyEnv];
  }

  return false;
}

