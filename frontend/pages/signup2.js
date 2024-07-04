import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Signup2.module.css';
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Signup2() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const router = useRouter();

  useEffect(() => {
    const allowed = localStorage.getItem('allowedToSignup2');
    if (!allowed) {
      router.push('/signup1');
    }

    return () => {
      localStorage.removeItem('allowedToSignup2');
      localStorage.removeItem('termsChecked');
    };
  }, [router]);

  const handleNicknameChange = (e) => {
    const { value } = e.target;
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value);

    if ((isKorean && value.length <= 4) || (!isKorean && value.length <= 6)) {
      setNickname(value);
    } else {
      alert('한글 4자 이하, 영어 6자 이하만 가능합니다.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      setPassword('');
      setConfirmPassword('');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/signup/`, { username, nickname, email, password, company, contact });
      localStorage.setItem('token', response.data.token);
      alert('회원가입 성공');
      router.push('/home');
    } catch (error) {
      if (error.response && error.response.data.error === 'Email already exists') {
        alert('이미 존재하는 이메일입니다.');
        setEmail('');
      } else {
        alert('회원가입 실패');
      }
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.progress}>
          <span>2 / 2</span>
          <div className={styles.progressBar}>
            <div className={styles.progressFilled} />
          </div>
        </div>
        <div className={styles.signupBox}>
          <div className={styles.logoContainer}>
            <Image src="/images/logo.png" alt="Voice Verity Logo" width={115} height={80} />
          </div>
          <h1 className={styles.title}>Voice Verity</h1>
          <p className={styles.subtitle}>가입에 필요한 정보를 입력해주세요.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="사용자 이름"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.inputField}
            />
            <input
              type="text"
              placeholder="닉네임(한글 4자 이하, 영어 6자 이하)"
              value={nickname}
              onChange={handleNicknameChange}
              required
              className={styles.inputField}
            />
            <input
              type="email"
              placeholder="이메일"
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
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className={styles.inputField}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.inputField}
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.inputField}
            />
            <button type="submit" className={styles.signupButton}>회원 가입</button>
          </form>
          <button onClick={() => router.push('/signup1')} className={styles.backButton}>뒤로 가기</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
