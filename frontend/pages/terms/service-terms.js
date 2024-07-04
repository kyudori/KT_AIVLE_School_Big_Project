import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../../styles/Terms.module.css';

export default function ServiceTerms() {
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <h1>Voice Verity 통합서비스 약관</h1>
        <p>여기에 Voice Verity 통합서비스 약관 내용을 작성합니다.</p>
      </div>
      <Footer />
    </div>
  );
}
