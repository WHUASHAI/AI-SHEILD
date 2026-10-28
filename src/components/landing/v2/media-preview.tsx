import Image from 'next/image';
import { FileText, Film, ScanFace, BookOpen } from 'lucide-react';
import styles from './landing-v2.module.css';

export type PreviewKind = 'text' | 'image' | 'video' | 'deepfake' | 'plagiarism';

export function TextPreview() {
  return (
    <div className={styles.document} aria-label="Illustrative text preview">
      <div className={styles.documentTop}>
        <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
        <FileText size={16} aria-hidden="true" />
      </div>
      <div className={styles.sampleCopy}>
        <p className={styles.sampleFilename}>sample.txt</p>
        <h4 className={styles.sampleTitle}>A story in the details.</h4>
        <p>On the way home, I stopped at the little café by the station. Rain tapped against the windows, and someone had left a book open on the table.</p>
        <p><mark>Small details make a story feel personal.</mark> An analysis can highlight patterns in writing, but context still matters.</p>
        <span className={styles.sampleNote}>Sample passage. Highlights are illustrative.</span>
      </div>
    </div>
  );
}

function PlagiarismPreview() {
  return (
    <div className={`${styles.document} ${styles.comparison}`} aria-label="Illustrative passage comparison">
      <div className={styles.documentTop}>
        <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
        <BookOpen size={16} aria-hidden="true" />
      </div>
      <div className={styles.sampleCopy}>
        <p className={styles.sampleFilename}>Passage comparison</p>
        <h4 className={styles.sampleTitle}>Follow the words to their source.</h4>
        <div className={styles.comparisonPassages}>
          <div className={styles.comparisonPassage}>
            <p className={styles.passageLabel}>Submitted passage</p>
            <p>In busy cities, <mark>urban gardens turn unused spaces into places where communities grow</mark>. They bring neighbors together, one season at a time.</p>
          </div>
          <div className={styles.comparisonPassage}>
            <p className={styles.passageLabel}>Example source</p>
            <p><mark>Urban gardens turn unused spaces into places where communities grow</mark>. Shared plots can create room for food, conversation, and connection.</p>
          </div>
        </div>
        <span className={styles.sampleNote}>Fictional passages. Highlighted phrases show an illustrative overlap.</span>
      </div>
    </div>
  );
}

export function MediaPreview({ kind }: { kind: PreviewKind }) {
  if (kind === 'text') return <TextPreview />;
  if (kind === 'plagiarism') return <PlagiarismPreview />;

  const landscape = kind === 'video';
  const deepfake = kind === 'deepfake';
  return (
    <div className={`${styles.photograph} ${landscape ? styles.landscape : ''}`}>
      <Image
        src={landscape ? '/landing-v2/coast.webp' : deepfake ? '/landing-v2/deepfake-interview.webp' : '/landing-v2/portrait.webp'}
        alt={landscape ? 'Illustrative coastal mountain scene under a cloudy sky' : deepfake ? 'Illustrative interview still of a man for facial manipulation analysis' : 'Illustrative editorial portrait in soft blue light'}
        fill
        sizes="(max-width: 760px) 90vw, 680px"
        className={styles.mediaImage}
      />
      {!landscape && <div className={styles.scanLine} aria-hidden="true" />}
      {deepfake && <div className={styles.faceFrame} aria-hidden="true"><ScanFace size={28} /></div>}
      {landscape && <div className={styles.sampleFrame}><Film size={15} aria-hidden="true" /><span>Sample frame</span><span className={styles.frameTrack} aria-hidden="true" /></div>}
    </div>
  );
}
