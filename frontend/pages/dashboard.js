// pages/Dashboard.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}/api/user-info/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('사용자 정보 가져오기 오류', error);
      });
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleLogoClick = () => {
    router.push('/home');
  };

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        <div className={styles.sidebar}>
          <div className={styles.logo} onClick={handleLogoClick}>
            <img src="/images/logo.png" alt="Voice Verity Logo" />
          </div>
          <ul className={styles.menu}>
            <li className={styles.active}>Dashboard</li>
            <li>API 관리</li>
            <li>보안 및 인증</li>
            <li>알림 설정</li>
          </ul>
        </div>
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>DashBoard</h1>
              <span>Welcome! {user ? user.username : '[User name]'}!</span>
            </div>
            <div className={styles.user} onClick={toggleDropdown}>
              <img src={user ? `${BACKEND_URL}${user.profile_image_url}` : '/images/userinfo/profile_default.png'} alt="Profile" className={styles.profileImage} />
              <div>
                <span className={styles.userName}>{user ? user.username : 'User Name'}</span>
                <span className={styles.userEmail}>{user ? user.email : 'User ID'}</span>
              </div>
              <div className={styles.dropdownIcon}>▼</div>
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <ul>
                    <li onClick={() => handleNavigation('/user-info')}>내정보</li>
                    <li onClick={() => handleNavigation('/plan')}>내구독</li>
                    <li onClick={handleLogout}>로그아웃</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.row}>
              <div className={styles.card}>
                <h3>Daily Credit</h3>
                <div className={styles.credit}>38%</div>
              </div>
              <div className={styles.card}>
                <h3>Additional Credit</h3>
                <div className={styles.credit}>38%</div>
              </div>
              <div className={styles.card}>
                <h3>API Status</h3>
                <p>내 API Key : sk-kdjlkjafij921uij</p>
                <p>현재 API 상태 : 정상 <span className={styles.status}></span></p>
                <p>마지막 사용 시간 : 2000/00/00 00:00:00</p>
              </div>
            </div>
            <div className={styles.trafficSummary}>
              <div className={styles.traffic}>
                <h3>Traffic</h3>
                <div className={styles.graph}>시간별 / 일별 / 월별 / 년별 API 응답 요청 수 그래프</div>
              </div>
              <div className={styles.summary}>
                <h3>Summary</h3>
                <div className={styles.graph}>오류율 그래프</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
