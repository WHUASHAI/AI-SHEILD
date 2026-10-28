import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { StartScanButton } from './start-scan-button';
import { ToolExplorer } from './tool-explorer';
import styles from './landing-v2.module.css';

const steps = [
  { title: 'Bring your content', description: 'Paste your text or choose an image or video to explore.' },
  { title: 'Look at the signals', description: 'Review the patterns and probabilities returned by the analysis.' },
  { title: 'Make an informed call', description: 'Put the results in context and decide what to check next.' },
];

const questions = [
  { question: 'Is Elucid AI free to use?', answer: 'Yes. You can explore the detection tools without a subscription or a credit card.' },
  { question: 'Do I need an account?', answer: 'No. Continue as a guest to explore the scanning tools, or choose Google sign-in when you want to return with an account.' },
  { question: 'What can I scan?', answer: 'Text, images, and video, with dedicated tools for deepfake detection and checking text against matching sources on the web.' },
  { question: 'How should I interpret a result?', answer: 'Treat it as a probability estimate, then consider the source, surrounding context, and other evidence. Detection tools can make mistakes.' },
];

export function LandingPageV2() {
  return (
    <div className={styles.page} data-landing-version="2.0">
      <ToolExplorer />

      <section className={`${styles.shell} ${styles.processSection}`} aria-labelledby="process-heading">
        <h2 id="process-heading" className={styles.sectionHeading}>From question to{' '}<span className={styles.serif}>a clearer picture.</span></h2>
        <div className={styles.steps}>
          {steps.map((step, index) => <div className={styles.step} key={step.title}><div className={styles.stepTop}><span>0{index + 1}</span><i aria-hidden="true" /></div><h3>{step.title}</h3><p>{step.description}</p></div>)}
        </div>
      </section>

      <section className={`${styles.shell} ${styles.trustSection}`} aria-labelledby="trust-heading">
        <h2 id="trust-heading" className={styles.sectionHeading}>Useful signals.{' '}<span className={styles.serif}>Human judgment.</span></h2>
        <div><p>Detection is probabilistic. Use the results alongside context, source checks, and your own judgment.</p><Link className={styles.textLink} href="/limitations">Understand the limitations <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section>

      <section className={`${styles.shell} ${styles.faqSection}`} aria-labelledby="faq-heading">
        <h2 id="faq-heading" className={styles.sectionHeading}>Good questions.{' '}<span className={styles.serif}>Clear answers.</span></h2>
        <div className={styles.questions}>
          {questions.map((item, index) => <details key={item.question} className={styles.question} open={index === 0}><summary>{item.question}<span className={styles.disclosureIcon} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}
        </div>
      </section>

      <section className={styles.finalSection} aria-labelledby="final-heading">
        <div className={styles.shell}>
          <h2 id="final-heading" className={styles.finalHeading}>A clearer view{' '}<span className={styles.serif}>starts here.</span></h2>
          <p>Bring your content. We will help you look closer.</p>
          <StartScanButton />
          <span className={styles.finalNote}>Continue with Google or explore as a guest.</span>
        </div>
      </section>
    </div>
  );
}
