import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const filename = 'src/app/(dashboard)/layout.tsx';
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  fileName: filename,
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});

async function renderDashboard(session, requireAuth, authError = false) {
  const exports = {};
  // Exercise the layout's access decision without a running Next.js server or identity provider.
  const modules = {
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
    'next/navigation': { redirect: url => { throw new Error(`redirect:${url}`); } },
    '@/lib/auth': { auth: async () => {
      if (authError) throw new Error('Identity service unavailable');
      return session;
    } },
    '@/components/dashboard/dashboard-shell': { DashboardShell: 'DashboardShell' },
    '@/lib/email-verification': { isEmailConfirmed: async () => false },
  };
  vm.runInNewContext(outputText, {
    exports, process: { env: { REQUIRE_AUTH: requireAuth } },
    require(id) {
      assert.ok(id in modules, `Unexpected dependency: ${id}`);
      return modules[id];
    },
  });
  return exports.default({ children: 'scanning tools' });
}

test('authenticated Google users enter the dashboard without a second confirmation service', async () => {
  const result = await renderDashboard({ user: { id: 'google:123456', email: 'verified@gmail.com' } }, 'true');
  assert.equal(result.type, 'DashboardShell');
  assert.equal(result.props.children, 'scanning tools');
});

test('protected dashboard redirects missing sessions and authentication failures to sign-in', async () => {
  await assert.rejects(renderDashboard(null, 'true'), /^Error: redirect:\/sign-in$/);
  await assert.rejects(renderDashboard(null, 'true', true), /^Error: redirect:\/sign-in$/);
});

test('dashboard retains guest access when authentication is optional', async () => {
  assert.equal((await renderDashboard(null, 'false')).type, 'DashboardShell');
});
