
/**
 * Generates a simple hash code from a string.
 * @param str The string to hash.
 * @returns A numeric hash code.
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Generates a browser fingerprint based on various browser and system properties.
 * This is not cryptographically secure and is intended for simple client identification.
 * @returns A string representing the browser fingerprint.
 */
export const generateFingerprint = (): string => {
  const components: (string | number)[] = [];

  // Browser and OS
  components.push(navigator.userAgent);
  components.push(navigator.language);
  components.push(navigator.platform);
  
  // Screen properties
  components.push(window.screen.width);
  components.push(window.screen.height);
  components.push(window.screen.colorDepth);
  
  // Timezone
  components.push(new Date().getTimezoneOffset());

  // Canvas fingerprinting as a more unique identifier
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const txt = 'BrowserFP_BalDigitech_AI_v1.0';
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText(txt, 4, 17);
        components.push(canvas.toDataURL());
    }
  } catch (e) {
    // Ignore errors, e.g., if canvas is not supported
  }

  const fingerprintString = components.join('---');
  return simpleHash(fingerprintString).toString();
};
