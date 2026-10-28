import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { PUBLIC_NAV_LINKS } from '@/lib/public-navigation';
import styles from './landing-v2.module.css';

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.footerMain}>
          <Link href="/" aria-label="Elucid AI home"><Logo size="md" /></Link>
          <nav className={styles.footerNavigation} aria-label="Footer navigation">
            {PUBLIC_NAV_LINKS.map(link => <Link key={link.href} href={link.href}>{link.name}</Link>)}
          </nav>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Elucid AI. All rights reserved.</p>
          <p>Detection is probabilistic. Always consider context and additional sources.</p>
        </div>
      </div>
    </footer>
  );
}
