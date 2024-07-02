import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { useState } from 'react';


export default function Home() {
  const router = useRouter();

  const handleTryVoiceVerity = () => {
    router.push('/try');
  };

  const [isOn, setisOn] = useState(true);

  const toggleHandler = () => {
    setisOn( prevState=> !prevState);
  }; 

  return (
    <div className={styles.homeContainer}>
      <div className={styles.mainContent}>
          <Navbar />
        <div className={styles.textContainer}>
          <p className='phrase'>
            <span> 파헤치다, </span>
            <br className='gap'></br><span>구분하다,</span>
            <br className='gap'></br><span>진실을 말하다.</span>
          </p>
          <div className={styles.buttonContainer}>
            <div className={styles.logo}/>
            <button onClick={handleTryVoiceVerity}>Try Voice Verity</button>
          </div>
        </div>
        <div className={styles.infoSection}>
          <h2>Voice Verity, 목소리에 진실성을 더하다.</h2>
          <p>수화기 너머의 목소리가 진짜 목소리일까요?</p><br />
          <div className={styles.infoItems}>
            <div className={styles.infoItem}>
              <h2>Preview</h2>
              <h3>슈뢰딩거의 목소리를 체험해보려면</h3>
              <p>이거 내 목소리 맞아?</p>
              <p>얼마나 진짜 같을까? Fake Voice!</p>
              <button className={styles.infobutton}>체험하러 가기</button>
            </div>
            <div className={styles.infoItem}>
              <h2>API Service</h2>
              <h3>우리 서비스를 구독하고 싶다면</h3>
              <p>아 싸다싸!</p>
              <p>우리 서비스 완전 싸요!</p>
              <button>구독플랜 보기</button>
            </div>
          </div>
        </div>
        <div className={styles.voiceverity}>
          <h2>독보적인 AI 음성 탐지 기술, Voice Verity</h2>
          <p>Voice Verity는 짧은 시간의 통화음으로도 목소리를 구별하는 기술을 갖추고 있습니다.</p>
          <div>
            <div /><ul>Building a Deep voice dataset</ul>
            <li>생성형 AI를 이용한 고품질 한국어 딥보이스 데이터셋 자체 구축했습니다.</li>
          </div>
          <div>
            <div /><ul>Deep Learning Deep Voice Classifier</ul>
            <li>딥러닝 기반의 딥보이스 분류 모델을 개발하여 정확하게 딥보이스를 감지합니다.</li>
          </div>
          <div>
            <div /><ul>Real-time Deep voice Classifier</ul>
            <li>최신 딥러닝 모델을 이용하여 높은 정확성과 빠른 추론 속도의 모델을 이용하여 통화 상태에서의 실시간 딥보이스 분류 지원합니다.</li>
          </div>
        </div>
        <div className={styles.listensection}>
          <h2>Deep Voice(딥보이스)를 들어보세요</h2>
          <p>사이버 범죄 수법으로 Deep Voice를 사용하는 비율이 늘어나고 있습니다.</p>
          <p>실제 사람의 목소리와 얼마나 비슷한지 귀 기울여 들어보세요.</p>
          <section>
            <li>사진 속 인물과 목소리의 주인은 전혀 다른 사람임을 알려드립니다.</li>
            <div>
              <div>
                <div />
                <button className={`${styles.toggle} ${isOn ? styles.real : styles.fake}`} onClick={toggleHandler}>
                <div className={styles.toggleitem}></div></button><p> {isOn ? 'Real Voice' : 'Fake Voice'}</p>
              </div>
            </div>
            <div></div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
