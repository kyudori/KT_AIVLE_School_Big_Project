import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Docs.module.css';

export default function Documentation() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(`.${styles.section}`);
      let currentSection = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 50) {
          currentSection = section.getAttribute('id');
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToSetting = () => {
    router.push('/setting');
  };

  return (
    <div className={styles.documentationContainer}>
      <Navbar />
      <div className={styles.contentContainer}>
        <div className={styles.sidebar}>
          <ul className={styles.sidebarList}>
            <li
              className={activeSection === 'start' ? styles.active : ''}
              onClick={() => handleScrollToSection('start')}
            >
              시작 하기
            </li>
            <li
              className={activeSection === 'supported-files' ? styles.active : ''}
              onClick={() => handleScrollToSection('supported-files')}
            >
              지원 파일
            </li>
            <li
              className={activeSection === 'authentication' ? styles.active : ''}
              onClick={() => handleScrollToSection('authentication')}
            >
              인증
            </li>
            <li
              className={activeSection === 'endpoints' ? styles.active : ''}
              onClick={() => handleScrollToSection('endpoints')}
            >
              엔드 포인트
            </li>
            <li
              className={activeSection === 'error-codes' ? styles.active : ''}
              onClick={() => handleScrollToSection('error-codes')}
            >
              에러 코드
            </li>
          </ul>
        </div>
        <div className={styles.content}>
          <section id="start" className={styles.section}>
            <h1 className={styles.heading}>Voice Verity documentation</h1>
            <p>Voice Verity는 KT AivleSchool 5기 AI Track 8조가 제공하는 API 및 플랫폼 서비스 입니다.</p>
            <div className={styles.cardContainer}>
              <div className={styles.card} onClick={() => handleScrollToSection('start')}>
                <h2>시작 하기</h2>
                <p>Read documentation &gt;</p>
              </div>
              <div className={styles.card} onClick={handleNavigateToSetting}>
                <h2>Key 발급</h2>
                <p>Go to Setting &gt;</p>
              </div>
            </div>
            <p>Voice Verity는 음성 파일에 대해 Deep Fake 여부를 판별합니다.</p>
          </section>
          <section id="supported-files" className={styles.section}>
            <h2>지원하는 파일 형식</h2>
            <div className={styles.fileFormats}>
              <span className={styles.fileFormat}>.wav</span>
              <span className={styles.fileFormat}>.mp3</span>
              <span className={styles.fileFormat}>.m4a</span>
            </div>
            <p>10MB 이하의 음성 파일</p>
          </section>
          <section id="authentication" className={styles.section}>
            <h2>인증</h2>
            <p>플랫폼에 회원가입 및 로그인하여 API 키를 발급받습니다.</p>
            <pre>Authorization: Bearer YOUR_API_KEY</pre>
          </section>
          <section id="endpoints" className={styles.section}>
            <h2>엔드 포인트</h2>
            <h3>1. 판별(Decision)</h3>
            <pre>
              {`URL: /api/decision
Method: POST
설명: 업로드한 음성 파일을 기반으로 AI 모델로부터 Fake 여부를 판단합니다.
요청 형식(json):
{
  "data": [
    {
      "feature1": value1,
      "feature2": value2,
      "feature3": value3
    }
  ]
}
응답(json):
{
  "prediction": [예측값1, 예측값2, ...]
}`}
            </pre>
            <h3>2. 상태(Status)</h3>
            <pre>
              {`URL: /api/status
Method: GET
설명: 호출하는 API 모델의 상태를 확인합니다.
응답(json):
{
  "status": "ready",
  "version": "1.0.0"
}`}
            </pre>
          </section>
          <section id="error-codes" className={styles.section}>
            <h2>에러 코드</h2>
            <ul>
              <li>400 Bad Request: 잘못된 요청 형식입니다.</li>
              <li>401 Unauthorized: 인증 실패입니다. 올바른 API 키를 제공하십시오.</li>
              <li>403 Forbidden: 접근 권한이 없습니다.</li>
              <li>404 Not Found: 요청한 리소스를 찾을 수 없습니다.</li>
              <li>500 Internal Server Error: 서버에 문제가 발생했습니다.</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
