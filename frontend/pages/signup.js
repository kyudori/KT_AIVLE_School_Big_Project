// signup.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Signup.module.css';
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      alert('이미 로그인 상태입니다.');
      router.push('/home');
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username) {
      alert('사용자 이름은 필수 항목입니다.');
      document.getElementById('username').focus();
      return;
    }
    if (!email) {
      alert('이메일은 필수 항목입니다.');
      document.getElementById('email').focus();
      return;
    }
    if (!contact) {
      alert('연락처는 필수 항목입니다.');
      document.getElementById('contact').focus();
      return;
    }
    if (!password) {
      alert('비밀번호는 필수 항목입니다.');
      document.getElementById('password').focus();
      return;
    }
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      setPassword('');
      setConfirmPassword('');
      document.getElementById('password').focus();
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}/api/signup/`, { username, email, password, company, contact });
      localStorage.setItem('token', response.data.token);
      alert('회원가입 성공');
      router.push('/home');
    } catch (error) {
      if (error.response && error.response.data.error === 'Email already exists') {
        alert('이미 존재하는 이메일입니다.');
        setEmail('');
        document.getElementById('email').focus();
      }
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.signupBox}>
        <div className={styles.logoContainer}>
            <Image src="/images/logo.png" alt="Voice Volice Logo" width={115} height={80} />
          </div>
          {/* <h1 className={styles.title}>회원가입</h1> */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="사용자 이름"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.inputField}
            />
            <input
              type="email"
              placeholder="이메일"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.inputField}
            />
            <input
              type="text"
              placeholder="회사 (선택사항)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={styles.inputField}
            />
            <input
              type="text"
              placeholder="연락처 ('-' 없이 입력)"
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className={styles.inputField}
            />
            <input
              type="password"
              placeholder="비밀번호"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.inputField}
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.inputField}
            />
            <button type="submit" className={styles.signupButton}>회원가입</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
