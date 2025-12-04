/**
 * Utility functions for carrier detection from phone numbers
 */

import {
  parsePhoneNumber,
  getCountryCallingCode,
  AsYouType,
} from "libphonenumber-js";
import type { CountryCode } from "./country-detection";

export interface CarrierInfo {
  country: CountryCode;
  countryCode: string;
  countryName?: string;
  carrier?: string;
  isValid: boolean;
  formattedNumber: string;
}

// Country code to name mapping
const COUNTRY_NAMES: Partial<Record<CountryCode, string>> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  PT: "Portugal",
  GR: "Greece",
  IE: "Ireland",
  NZ: "New Zealand",
  JP: "Japan",
  CN: "China",
  IN: "India",
  KR: "South Korea",
  SG: "Singapore",
  MY: "Malaysia",
  TH: "Thailand",
  ID: "Indonesia",
  PH: "Philippines",
  VN: "Vietnam",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  ZA: "South Africa",
  EG: "Egypt",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IL: "Israel",
  TR: "Turkey",
  RU: "Russia",
} as const;

/**
 * Get carrier information from phone number
 * Note: Actual carrier detection requires a paid service, but we can provide country and formatting
 */
export function getCarrierInfo(phoneNumber: string): CarrierInfo | null {
  try {
    if (!phoneNumber) return null;

    // Parse the phone number
    const phoneNumberObj = parsePhoneNumber(phoneNumber);

    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return null;
    }

    const country = phoneNumberObj.country as CountryCode;
    const countryCode = phoneNumberObj.countryCallingCode;
    const formattedNumber = phoneNumberObj.formatInternational();

    // Basic carrier detection based on country and number patterns
    // This is a simplified version - for actual carrier detection, you'd need a service like Twilio Lookup
    const carrier = detectCarrierFromPattern(
      phoneNumberObj.nationalNumber,
      country
    );

    return {
      country: country || "US",
      countryCode: `+${countryCode}`,
      countryName: country ? COUNTRY_NAMES[country] || country : undefined,
      carrier,
      isValid: true,
      formattedNumber,
    };
  } catch (error) {
    console.error("Error parsing phone number:", error);
    return null;
  }
}

/**
 * Simplified carrier detection based on number patterns
 * This is a basic implementation - for production, use a service like Twilio Lookup API
 */
function detectCarrierFromPattern(
  nationalNumber: string,
  country: CountryCode | undefined
): string | undefined {
  if (!country || !nationalNumber) return undefined;

  // This is a very simplified carrier detection
  // In production, you'd use a service like:
  // - Twilio Lookup API
  // - Google's libphonenumber carrier mapping
  // - NumLookup API

  // For now, return undefined as we don't have a reliable free service
  // The phone number will still work, we just won't show carrier info
  return undefined;
}

/**
 * Format phone number with country code
 */
export function formatPhoneNumber(
  phoneNumber: string,
  country?: CountryCode
): string {
  try {
    if (!phoneNumber) return "";

    // AsYouType expects CountryCode from libphonenumber-js or an options object
    // If country is provided, use it; otherwise pass undefined
    const asYouType = country ? new AsYouType(country as any) : new AsYouType();
    return asYouType.input(phoneNumber);
  } catch (error) {
    return phoneNumber;
  }
}

/**
 * Get country code from phone number
 */
export function getCountryFromPhoneNumber(
  phoneNumber: string
): CountryCode | null {
  try {
    const phoneNumberObj = parsePhoneNumber(phoneNumber);
    return (phoneNumberObj?.country as CountryCode) || null;
  } catch (error) {
    return null;
  }
}
