import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../../styles/Terms.module.css';

export default function VoiceCollectionTerms() {
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <h1>음성 보이스 수집 및 이용 동의</h1>
        <p>여기에 음성 보이스 수집 및 이용 동의 내용을 작성합니다.</p>
      </div>
      <Footer />
    </div>
  );
}
