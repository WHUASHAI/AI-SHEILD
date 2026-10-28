'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MediaPreview, type PreviewKind } from './media-preview';
import { StartScanButton } from './start-scan-button';
import styles from './landing-v2.module.css';

const tools: { id: PreviewKind; title: string; description: string }[] = [
  { id: 'text', title: 'Text detection', description: 'Explore linguistic patterns that can suggest AI-generated writing.' },
  { id: 'image', title: 'Image detection', description: 'Look for signs of synthetic generation and manipulation.' },
  { id: 'video', title: 'Video analysis', description: 'Examine sampled frames for generation and manipulation signals.' },
  { id: 'deepfake', title: 'Deepfake detection', description: 'Look more closely at possible manipulation in visible human faces.' },
  { id: 'plagiarism', title: 'Plagiarism check', description: 'Search sampled passages for matching sources on the indexed web.' },
];

export function ToolExplorer() {
  const [selected, setSelected] = useState<PreviewKind>('text');
  const active = tools.find(tool => tool.id === selected)!;

  return (
    <section id="detection-tools" className={`${styles.shell} ${styles.toolsSection}`} aria-labelledby="tools-heading">
      <div className={styles.toolLayout}>
        <div>
          <h1 id="tools-heading" className={styles.sectionHeading}>One place.{' '}<span className={styles.serif}>More perspective.</span></h1>
          <p className={styles.sectionDescription}>Choose the right lens for your content.</p>
          <div className={styles.toolList} role="group" aria-label="Choose a detection preview">
            {tools.map((tool, index) => (
              <button key={tool.id} id={`preview-${tool.id}`} type="button" aria-pressed={selected === tool.id} aria-controls="detection-preview" className={styles.toolButton} onClick={() => setSelected(tool.id)}>
                <span className={styles.toolNumber}>0{index + 1}</span><span>{tool.title}</span><ArrowUpRight size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
        <div id="detection-preview" className={styles.toolDetail} role="region" aria-labelledby={`preview-${selected}`}>
          <div className={styles.toolMedia} key={selected}>
            <MediaPreview kind={selected} />
            <span className={styles.exampleLabel}>Illustrative example</span>
          </div>
          <div aria-live="polite" aria-atomic="true">
            <h3 className={styles.toolTitle}>{active.title}</h3>
            <p className={styles.toolDescription}>{active.description}</p>
          </div>
          <StartScanButton />
        </div>
      </div>
    </section>
  );
}
