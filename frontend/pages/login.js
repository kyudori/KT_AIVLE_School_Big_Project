import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Login.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      alert('You are already logged in');
      router.push('/home');
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/api/login/`, { email, password });
      localStorage.setItem('token', response.data.token);
      router.push('/home');
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Voice Verity</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일 ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className={styles.loginButton}>로그인</button>
        </form>
        <div className={styles.linkContainer}>
          <p><Link href="/find-id" className={styles.link}>아이디</Link> / <Link href="/reset-password" className={styles.link}>비밀번호</Link>를 잊으셨습니까?</p>
          <p><Link href="/signup" className={styles.link}>회원가입</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
