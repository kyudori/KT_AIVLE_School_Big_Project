import Navbar from '../components/Navbar';
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
              집에 오니까 굉장히 덥고 습하고 충무로로 돌아가서 시원하게 짜장면 먹고 싶으나 사람 너무 많아서 빨리 나와야 하하하 힘내시죠 하하하 열받네</div>
            <div className={styles.infoItem}>
              <p className={styles.img}>🌼</p>
              태정태세문단세예성연종인명선언희순숙경영정순헌철고순가나다라마바사아차카타파하하하하하 오오유유유ㅜㅜ</div>
            <div className={styles.infoItem}>
              <p className={styles.img}>🚗</p>
              비싼 자동차!!!!!!!!!!! 관심없음!!!!!! 친가! 칠!!!!!!!!!ㅎㅎㅁㅁㅁㅁㅁ!!!!!!</div>
          </div>
          <div>
            <br/><br/><br/><br/><br/><br/>
            <h2>Do your Job.</h2>
          </div>
        </div>
      </div>
      <footer className={styles.foot}>
        <p className={styles.end}>신기한 스쿨버스</p>
          <ul className={styles.terms}>
            <li>서비스 약관</li>
            <hr></hr>
            <li>운영약관</li>
            <hr></hr>
            <li>개인정보보호약관</li>
          </ul>
      </footer>
    </div>
  );
}