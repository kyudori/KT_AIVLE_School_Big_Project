// user-info.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import styles from '../styles/UserInfo.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function UserInfo() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
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
        setUsername(response.data.name);
        setCompany(response.data.company);
        setContact(response.data.contact);
      })
      .catch(error => {
        console.error('사용자 정보 가져오기 오류', error);
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !contact) {
      alert('사용자 이름과 연락처 필드를 비워둘 수 없습니다.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${BACKEND_URL}/api/user-info/`, {
        name: username,
        company: company,
        contact: contact
      }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      alert('사용자 정보가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('사용자 정보 업데이트 오류', error);
      alert('사용자 정보 업데이트 오류');
    }
  };

  const handlePasswordChange = () => {
    router.push('/change-password');
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.userInfoBox}>
          <h1 className={styles.title}>사용자 정보</h1>
          {user ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label>이메일: {user.email}</label>
              </div>
              <div className={styles.fieldGroup}>
                <label>사용자 이름:</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                  className={styles.inputField}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>회사:</label>
                <input 
                  type="text" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  className={styles.inputField}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>연락처:</label>
                <input 
                  type="text" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  required
                  className={styles.inputField}
                />
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.button}>저장</button>
                <button type="button" onClick={handlePasswordChange} className={styles.button}>비밀번호 변경</button>
              </div>
            </form>
          ) : (
            <p>로딩 중...</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}