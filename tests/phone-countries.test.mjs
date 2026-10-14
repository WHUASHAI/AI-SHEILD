import assert from 'node:assert/strict';
import test from 'node:test';

const phones = await import('../src/lib/phone-countries.ts').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
function implementation(name) {
  assert.equal(typeof phones[name], 'function', `${name} must be implemented`);
  return phones[name];
}

test('calling-code list covers worldwide regions and preserves countries sharing a code', () => {
  const countries = phones.phoneCountries;
  assert.ok(Array.isArray(countries) && countries.length > 230);
  assert.equal(new Set(countries.map(country => country.country)).size, countries.length);
  for (const [country, callingCode] of [['PH', '63'], ['US', '1'], ['CA', '1'], ['GB', '44'], ['IN', '91'], ['SG', '65'], ['ZA', '27'], ['BR', '55'], ['AU', '61'], ['XK', '383']]) {
    assert.equal(countries.find(value => value.country === country)?.callingCode, callingCode);
  }
});

test('national numbers are normalized correctly with country-specific trunk prefixes', () => {
  const parse = implementation('getInternationalPhone');
  assert.equal(parse('PH', '0917 123 4567'), '+639171234567');
  assert.equal(parse('PH', '9171234567'), '+639171234567');
  assert.equal(parse('GB', '020 7946 0958'), '+442079460958');
  assert.equal(parse('US', '(202) 555-0123'), '+12025550123');
  assert.equal(parse('SG', '9123 4567'), '+6591234567');
  assert.equal(parse('TK', '7290'), '+6907290');
  assert.equal(parse('IT', '02 3661 8300'), '+390236618300');
});

test('international input is supported without double-prefixing, and country mismatches are rejected', () => {
  const parse = implementation('getInternationalPhone');
  assert.equal(parse('PH', '+63 917 123 4567'), '+639171234567');
  assert.equal(parse('PH', '+44 20 7946 0958'), null);
  assert.equal(implementation('getInternationalCountry')('+44 20 7946 0958'), 'GB');
  assert.equal(implementation('getInternationalCountry')('020 7946 0958'), null);
});

test('invalid regions, incomplete numbers, extensions, and hidden free-text numbers are rejected', () => {
  for (const input of ['', '123', '0000000000', 'call 09171234567', '09171234567 ext. 123', '09171234567;123', '+639171234567' + ' '.repeat(100)]) {
    assert.equal(implementation('getInternationalPhone')('PH', input), null);
  }
  assert.equal(implementation('getInternationalPhone')('XX', '9171234567'), null);
});
