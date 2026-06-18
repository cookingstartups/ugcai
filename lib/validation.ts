/**
 * Input validation and sanitization utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_TEXT_LENGTH = 5000; // Maximum characters for video text
const MIN_TEXT_LENGTH = 10; // Minimum characters for video text

/**
 * Sanitize text input - remove potentially harmful characters
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Validate text input for video generation
 */
export function validateText(text: string): ValidationResult {
  if (!text || typeof text !== "string") {
    return {
      valid: false,
      error: "El texto es obligatorio",
    };
  }

  const sanitized = sanitizeText(text);

  if (sanitized.length < MIN_TEXT_LENGTH) {
    return {
      valid: false,
      error: `El texto debe tener al menos ${MIN_TEXT_LENGTH} caracteres`,
    };
  }

  if (sanitized.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `El texto no puede superar los ${MAX_TEXT_LENGTH} caracteres`,
    };
  }

  // Check for potentially harmful patterns
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(sanitized)) {
      return {
        valid: false,
        error: "El texto fue rechazado por motivos de seguridad",
      };
    }
  }

  return {
    valid: true,
  };
}

/**
 * Validate voice ID format
 */
export function validateVoiceId(voiceId: string | null | undefined): ValidationResult {
  if (!voiceId) {
    return {
      valid: true, // Voice ID is optional
    };
  }

  if (typeof voiceId !== "string") {
    return {
      valid: false,
      error: "Formato de ID de voz no válido",
    };
  }

  // ElevenLabs voice IDs are typically 21 alphanumeric characters
  if (!/^[a-zA-Z0-9]{21}$/.test(voiceId)) {
    return {
      valid: false,
      error: "El ID de voz debe tener 21 caracteres alfanuméricos",
    };
  }

  return {
    valid: true,
  };
}

/**
 * Validate video settings
 */
export function validateVideoSettings(settings: {
  duration?: number;
  resolution?: string;
  style?: string;
}): ValidationResult {
  // Validate duration
  if (settings.duration !== undefined) {
    const validDurations = [5, 8, 15, 30];
    if (!validDurations.includes(settings.duration)) {
      return {
        valid: false,
        error: `Duración de video no válida. Valores permitidos: ${validDurations.join(", ")} segundos`,
      };
    }
  }

  // Validate resolution
  if (settings.resolution !== undefined) {
    const validResolutions = ["720p", "1080p", "4K"];
    if (!validResolutions.includes(settings.resolution)) {
      return {
        valid: false,
        error: `Resolución no válida. Valores permitidos: ${validResolutions.join(", ")}`,
      };
    }
  }

  // Validate style
  if (settings.style !== undefined) {
    const validStyles = ["professional", "friendly", "energetic", "calm", "dramatic"];
    if (!validStyles.includes(settings.style)) {
      return {
        valid: false,
        error: `Estilo de video no válido. Valores permitidos: ${validStyles.join(", ")}`,
      };
    }
  }

  return {
    valid: true,
  };
}

/**
 * Estimate video duration based on text length
 * Average speaking rate: ~150 words per minute = ~2.5 words per second
 */
export function estimateVideoDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const estimatedSeconds = Math.ceil(words / 2.5);
  return Math.max(5, Math.min(30, estimatedSeconds)); // Clamp between 5-30 seconds
}

