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
          <h1>Voice Verity</h1>
          <p>파헤치다, 구분하다, 진실을 말하다.</p>
          <button className={styles.try} onClick={handleTryVoiceVerity}>Try Voice Verity</button>
        </div>
        <div className={styles.infoSection}>
          <h2>완전 대박 사실!</h2>
          <div className={styles.infoItems}>
            <div>집에 오니까 굉장히 덥고 습하고 충무로로 돌아가서 시원하게 짜장면 먹고 싶으나 사람 너무 많아서 빨리 나와야 하하하 힘내시죠 하하하 열받네</div>
            <div>태정태세문단세예성연종인명선언희순숙경영정순헌철고순가나다라마바사아차카타파하하하하하 오오유유유ㅜㅜ</div>
            <div>비싼 자동차!!!!!!!!!!! 관심없음!!!!!! 친가! 칠!!!!!!!!!ㅎㅎㅁㅁㅁㅁㅁ!!!!!!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
