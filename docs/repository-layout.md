# Repository layout repair — 22 October 2026

The active project is now the repository root:

`C:\Users\Admin_IT PC1\Desktop\AI-SHIELD`

Run npm and Git commands there. The root contains `package.json`, `src/`, `prisma/`, and `tests/`.

## What happened

The same GitHub repository existed twice: at the workspace root and inside `AI-SHEILD/`. The outer repository tracked the inner repository as a Git link (mode `160000`) without a corresponding `.gitmodules` definition. The Google fixes were committed only in the inner repository, so the root application still contained the earlier code.

The Google fixes have been applied to the root. Before archiving, all 169 project files were compared; there were no differences in file content beyond line endings after consolidation. The old inner project, including its Git history at commit `1dbd25c`, is preserved in:

`.local-backups/AI-SHEILD-2026-10-22/`

That backup and the old nested path are ignored by the outer repository. Existing inventory/photo deletions were not changed or staged.

## Finish the Git cleanup

This agent session cannot modify the outer `.git` metadata. Removing the embedded Git entry failed with permission denied for `.git/index.lock`. The inner folder's empty hidden `.git` directory also could not be removed by this session. No active application files remain in that inner folder.

Run the following in your normal PowerShell terminal, from the workspace root:

```powershell
git rm --cached -- AI-SHEILD
git add -- .gitignore .env.example src tests scripts package.json docs
git diff --cached --stat
git commit -m "Consolidate project at repository root and fix Google sign-in"
git push origin main
```

The explicit staging paths avoid including the existing `BACKUP-INV/` deletions. Review the staged summary before committing. Do not run these commands from the archived backup.

Once the Git entry is removed, the empty `AI-SHEILD/` remnant is ignored. If you want to remove the empty folders too, first inspect them using `Get-ChildItem -Force .\AI-SHEILD` and `Get-ChildItem -Force .\AI-SHEILD\.git`. Only if `.git` contains no files or folders, remove that empty directory with `Remove-Item -LiteralPath .\AI-SHEILD\.git -Force`, then remove the empty parent with `Remove-Item -LiteralPath .\AI-SHEILD`. Do not use recursive deletion; the preserved backup should remain untouched.

## Vercel

The Vercel Root Directory should point to the repository root (the default), not `AI-SHEILD/` or `.local-backups/`. No Vercel settings were changed by this repair. Push the root consolidation commit before deploying it.

## Verification

The root project passed 19 targeted authentication/dashboard checks after consolidation, and `git diff --check` passed with submodule differences excluded. Full build and live Google sign-in remain unverified because project dependencies are unavailable and this environment cannot connect to GitHub. The archived repository's history remains readable.
