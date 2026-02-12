/**
 * Detects device type from user-agent string
 * @param userAgent - The user-agent string from request headers
 * @returns 'mobile' | 'tablet' | 'desktop' | 'unknown'
 */
export function detectDevice(userAgent: string | null): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    // Check for mobile devices
    if (/(android|webos|iphone|ipod|blackberry|iemobile|opera mini)/i.test(ua)) {
        return 'mobile';
    }

    // Check for tablets
    if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
        return 'tablet';
    }

    // Default to desktop
    if (/(windows|macintosh|linux|x11)/i.test(ua)) {
        return 'desktop';
    }

    return 'unknown';
}

/**
 * Extracts location information from geolocation API response
 * @param address - Full address string from reverse geocoding
 * @returns Object with city and country
 */
export function extractLocationInfo(address: string): { city: string; country: string } {
    // Simple extraction - splits address and takes last two parts
    const parts = address.split(',').map(p => p.trim());

    if (parts.length >= 2) {
        return {
            city: parts[parts.length - 2] || 'Unknown',
            country: parts[parts.length - 1] || 'Unknown',
        };
    }

    return {
        city: 'Unknown',
        country: 'Unknown',
    };
}
