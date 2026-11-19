'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { checkLocalPlagiarism, plagiarismTextLimit } from '@/lib/local-plagiarism';
import type { PlagiarismBackup } from '@/lib/plagiarism-backup';

export function LocalPlagiarismReport({ text, backup }: { text: string; backup: PlagiarismBackup }) {
  const [report, setReport] = useState(backup.report);
  const [reference, setReference] = useState('');
  const [referenceError, setReferenceError] = useState('');

  function compare() {
    try {
      setReport(checkLocalPlagiarism(text, reference, backup.additional));
      setReferenceError('');
    } catch (error) {
      setReferenceError(error instanceof Error ? error.message : 'Could not read the comparison source.');
    }
  }

  return (
    <section className="glass-card rounded-2xl p-6 space-y-4" aria-label="On-device plagiarism check">
      <div aria-live="polite">
        <h2 className="font-bold text-foreground">On-device source comparison</h2>
        <p className="mt-2 text-2xl font-bold text-foreground">{report.overlap}% word overlap</p>
        <p className="mt-1 text-sm text-air-sup-blue">
          {report.matchedWords} of {report.wordCount} words matched across {report.sourcesChecked.length} checked sources.
          {' '}Matches require six consecutive words.
        </p>
        <p className="mt-1 text-sm text-air-sup-blue">{backup.searchedWikipedia
          ? `English Wikipedia returned ${backup.additional.length} source excerpts for the sampled phrases.`
          : 'Online search was unavailable. Coverage is limited to the sources listed below.'}</p>
      </div>
      {report.matches.length > 0 ? (
        <ul className="space-y-3 text-sm">
          {report.matches.map(match => (
            <li key={match.url || match.title} className="rounded-xl border border-cyan-azure/20 p-3">
              <p className="font-medium">{match.title}</p>
              <p className="text-xs text-air-sup-blue">{match.matchedWords} matching words</p>
              <blockquote className="mt-2 text-air-sup-blue">“{match.excerpt}”</blockquote>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-air-sup-blue">No matching passage appeared in the checked sources. Material copied from other sources can still go undetected.</p>}
      <details className="text-sm text-air-sup-blue">
        <summary className="cursor-pointer font-medium text-foreground">Sources checked ({report.sourcesChecked.length})</summary>
        <ul className="mt-2 space-y-1">
          {report.sourcesChecked.map(source => (
            <li key={source.url || source.title}>{source.url
              ? <a className="underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
              : source.title}</li>
          ))}
        </ul>
      </details>
      <details className="border-t border-cyan-azure/15 pt-3 text-sm">
        <summary className="cursor-pointer font-medium">Compare with your own source</summary>
        <label className="mt-3 block text-air-sup-blue" htmlFor="comparison-source">Paste a passage to include in this local check.</label>
        <textarea id="comparison-source" value={reference} onChange={event => setReference(event.target.value)}
          maxLength={plagiarismTextLimit} rows={4} className="mt-2 w-full rounded-lg border border-cyan-azure/20 bg-space-cadet-dark p-3" />
        <Button type="button" variant="outline" onClick={compare}>Update comparison</Button>
        {referenceError && <p role="alert" className="mt-2 text-red-400">{referenceError}</p>}
      </details>
      <p className="text-xs text-air-sup-blue">This comparison stays on this page. History and website statistics exclude local checks.</p>
    </section>
  );
}
