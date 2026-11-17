import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { load } from './history-loader.mjs';
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToString } = require('react-dom/server');
const jsx = require('react/jsx-runtime');
const uiModules = { react: React, 'react/jsx-runtime': jsx, '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') } };
const button = load('src/components/ui/button.tsx', { ...uiModules,
  '@radix-ui/react-slot': require('@radix-ui/react-slot'), 'class-variance-authority': require('class-variance-authority') });
const textarea = load('src/components/ui/textarea.tsx', uiModules);
const page = load('src/app/(dashboard)/dashboard/text/page.tsx', { ...uiModules,
  'lucide-react': require('lucide-react'), '@/components/ui/button': button, '@/components/ui/textarea': textarea,
  '@/lib/use-local-text-detector': { useLocalTextDetector: () => ({ analyzeLocal() {}, localProgress: '', cancelLocal() {} }) },
  '@/lib/local-text-detector': load('src/lib/local-text-detector.ts', {}),
});

test('initial text controls have stable SSR state and opt out of Firefox form-state restoration', () => {
  const html = renderToString(React.createElement(page.default));
  const run = html.match(/<button\b[^>]*id="text-analysis-submit"[^>]*>/)?.[0];
  const input = html.match(/<textarea\b[^>]*id="text-analysis-input"[^>]*>/)?.[0];
  assert.ok(run, 'The run button has a stable identity.');
  assert.ok(input, 'The text input has a stable identity.');
  assert.match(run, /disabled=""/);
  assert.match(run, /type="button"/);
  assert.match(run, /autocomplete="off"/i);
  assert.match(input, /autocomplete="off"/i);
  assert.equal(html, renderToString(React.createElement(page.default)));
});
