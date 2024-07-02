import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.foot}>
      <p className={styles.end}>Voice Volice</p>
      <ul className={styles.terms}>
        <li>
          <Link href="/terms/service">서비스 약관</Link>
        </li>
        <li>
          <Link href="/terms/operation">운영약관</Link>
        </li>
        <li>
          <Link href="/terms/privacy">개인정보보호약관</Link>
        </li>
      </ul>
    </footer>
  );
}
