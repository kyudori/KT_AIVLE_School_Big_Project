import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../../styles/terms/Terms.module.css';

export default function Operation() {
  return (
    <div className={styles.termsContainer}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.heading}>운영 약관</h1>
        <p>본 약관은 서비스의 운영 방식 및 정책에 대한 규정을 설명합니다.</p>
        <p>1. 운영의 기본 원칙...</p>
        <p>2. 서비스 제공의 범위...</p>
        <p>3. 서비스의 유지보수...</p>
        <p>4. 사용자 지원 및 고객 서비스...</p>
        <p>5. 기타 운영 관련 정보...</p>
      </div>
      <Footer />
    </div>
  );
}
