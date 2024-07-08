import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/Contact.module.css";

export default function Contact() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Navbar />
        <div className={styles.main}>
          <h1>Contact Us</h1>
          <p>추후 기술 지원 및 문의 페이지 추가 예정입니다.</p>
          <p>게시판 기능</p>
        </div>
        <Footer />
      </div>
    </div>
  );
}
