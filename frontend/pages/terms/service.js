import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../../styles/terms/Terms.module.css';

export default function Service() {
  return (
    <div className={styles.termsContainer}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.heading}>서비스 약관</h1>
        <p>본 약관은 사용자와 서비스 제공자 간의 계약이며, 서비스 사용에 대한 규칙과 지침을 설명합니다.</p>
        <p>1. 서비스 이용에 대한 일반 조건...</p>
        <p>2. 사용자 계정 및 보안...</p>
        <p>3. 지불 및 환불 정책...</p>
        <p>4. 서비스의 중단 및 변경...</p>
        <p>5. 기타 중요 정보...</p>
      </div>
      <Footer />
    </div>
  );
}
