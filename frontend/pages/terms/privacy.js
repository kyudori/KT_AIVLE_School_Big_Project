import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../../styles/terms/Terms.module.css';

export default function Privacy() {
  return (
    <div className={styles.termsContainer}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.heading}>개인정보 보호정책</h1>
        <p>본 정책은 사용자의 개인정보가 어떻게 수집되고 사용되며 보호되는지에 대한 정보를 제공합니다.</p>
        <p>1. 수집하는 개인정보의 항목...</p>
        <p>2. 개인정보의 수집 및 이용 목적...</p>
        <p>3. 개인정보의 보유 및 이용 기간...</p>
        <p>4. 개인정보의 제3자 제공...</p>
        <p>5. 개인정보 보호를 위한 조치...</p>
      </div>
      <Footer />
    </div>
  );
}
