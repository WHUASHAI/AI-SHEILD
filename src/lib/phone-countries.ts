import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max';

export type PhoneCountry = { country: CountryCode; name: string; callingCode: string };
const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const phoneCountries: PhoneCountry[] = getCountries().map(country => ({
  country, name: displayNames.of(country) ?? country, callingCode: getCountryCallingCode(country),
})).sort((a, b) => a.name.localeCompare(b.name, 'en'));

const supportedCountries = new Set<string>(getCountries());

export function getInternationalPhone(country: string, value: string): string | null {
  if (!supportedCountries.has(country) || typeof value !== 'string' || value.length > 64 || !/^[+0-9\s().-]+$/.test(value)) return null;
  const region = country as CountryCode;
  const phone = parsePhoneNumberFromString(value, { defaultCountry: region, extract: false });
  if (!phone?.isValid() || phone.ext || phone.countryCallingCode !== getCountryCallingCode(region)) return null;
  return phone.number;
}

export function getInternationalCountry(value: string): CountryCode | null {
  if (!value.startsWith('+') || value.length > 64 || !/^[+0-9\s().-]+$/.test(value)) return null;
  const phone = parsePhoneNumberFromString(value, { extract: false });
  return phone?.isValid() && !phone.ext && phone.country ? phone.country : null;
}
