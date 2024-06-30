import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();

  const handleTryVoiceVerity = () => {
    router.push('/try');
  };

  return (
    <div className={styles.homeContainer}>
      <Navbar />
      <div className={styles.mainContent}>
        <div className={styles.textContainer}>
          <p className='phrase'>
            <span> 파헤치다, </span>
            <br className='gap'></br><span>구분하다,</span>
            <br className='gap'></br><span>진실을 말하다.</span>
          </p>
          <div className={styles.buttonContainer}>
            <button onClick={handleTryVoiceVerity}>Try Voice Verity</button>
          </div>
        </div>
        <div className={styles.infoSection}>
          <h2>완전 대박 사실!</h2>
          <div className={styles.infoItems}>
            <div className={styles.infoItem}>
              <p className={styles.img}>😒</p>
              KT AIVLE School AI Track 8조가 개발한 Voice Deep Fake 탐지 솔루션입니다.
            </div>
            <div className={styles.infoItem}>
              <p className={styles.img}>🌼</p>
              솔루션은 API 형태로 제공되며, 본 웹 서비스는 API를 사용하는 방법을 소개하고 간단하게 체험할 수 있습니다.
            </div>
            <div className={styles.infoItem}>
              <p className={styles.img}>🚗</p>
              회원 가입 후 Intro, Team, API, Docs, Try Voice Verity 페이지를 차례로 방문하여 저희의 솔루션을 직접 즐겨보세요.
            </div>
          </div>
          <div>
            <br /><br /><br /><br /><br /><br />
            <h2>Do your Job.</h2>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
