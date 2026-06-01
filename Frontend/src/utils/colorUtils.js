/**
 * Parses hex, rgb, or rgba color strings into an object with r, g, b, and a values.
 * @param {string} color 
 * @returns {{r: number, g: number, b: number, a: number} | null}
 */
export const parseColor = (color) => {
    if (!color) return null;

    // Hex
    if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
        return { r, g, b, a };
    }

    // RGB/RGBA
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
            a: match[4] ? parseFloat(match[4]) : 1
        };
    }

    return null;
};

/**
 * Calculates the relative luminance of a color.
 * Based on WCAG 2.0 formula for sRGB.
 * @param {number} r 0-255
 * @param {number} g 0-255
 * @param {number} b 0-255
 * @returns {number} 0-1
 */
export const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determines the best text color (black or white) for a given background color.
 * @param {string} backgroundColor Hex, RGB, or RGBA string
 * @returns {string} '#000000' or '#ffffff'
 */
export const getContrastColor = (backgroundColor) => {
    const color = parseColor(backgroundColor);
    if (!color) return '#000000'; // Default to black for safety

    // If the color is mostly transparent, assume it's on a light background
    if (color.a < 0.5) return '#000000';

    const luminance = getLuminance(color.r, color.g, color.b);

    // Threshold for luminance. 0.5 is a common choice, 
    // but WCAG recommends 0.179 for a slightly different approach.
    // 0.179 is usually better for accessibility.
    return luminance > 0.179 ? '#000000' : '#ffffff';
};
