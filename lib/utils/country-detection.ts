/**
 * Utility functions for country detection
 */

export type CountryCode = string;

/**
 * Detect country from browser locale
 */
export function detectCountryFromLocale(): CountryCode | null {
  if (typeof window === "undefined") return null;

  try {
    // Try to get country from browser locale
    const locale = navigator.language || (navigator as any).userLanguage;
    if (locale) {
      // Extract country code from locale (e.g., "en-US" -> "US")
      const parts = locale.split("-");
      if (parts.length > 1) {
        return parts[parts.length - 1].toUpperCase();
      }
    }

    // Try timezone as fallback
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      // Map common timezones to countries (simplified mapping)
      const timezoneToCountry: Record<string, string> = {
        "America/New_York": "US",
        "America/Los_Angeles": "US",
        "America/Chicago": "US",
        "America/Denver": "US",
        "Europe/London": "GB",
        "Europe/Paris": "FR",
        "Europe/Berlin": "DE",
        "Europe/Madrid": "ES",
        "Europe/Rome": "IT",
        "Asia/Tokyo": "JP",
        "Asia/Shanghai": "CN",
        "Asia/Dubai": "AE",
        "Asia/Kolkata": "IN",
        "Australia/Sydney": "AU",
        "America/Mexico_City": "MX",
        "America/Sao_Paulo": "BR",
        "America/Argentina/Buenos_Aires": "AR",
        "Africa/Cairo": "EG",
        "Africa/Johannesburg": "ZA",
      };

      return timezoneToCountry[timezone] || null;
    }
  } catch (error) {
    console.error("Error detecting country from locale:", error);
  }

  return null;
}

/**
 * Detect country from IP address using a free geolocation API
 */
export async function detectCountryFromIP(): Promise<CountryCode | null> {
  try {
    // Use ipapi.co free API (no API key required for basic usage)
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch country from IP");
    }

    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error("Error detecting country from IP:", error);
    return null;
  }
}

/**
 * Get user's country with fallback chain
 */
export async function getUserCountry(): Promise<CountryCode | null> {
  // First try IP-based detection
  const ipCountry = await detectCountryFromIP();
  if (ipCountry) {
    return ipCountry;
  }

  // Fallback to browser locale
  const localeCountry = detectCountryFromLocale();
  if (localeCountry) {
    return localeCountry;
  }

  // Default to US if nothing works
  return "US";
}

