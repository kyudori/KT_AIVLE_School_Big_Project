import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import styles from '../styles/ResetPassword.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!email || !username || !contact || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('PW가 일치하지 않습니다.');
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}api/reset-password/`, { email, username, contact, password });
      if (response.data.error) {
        alert(response.data.error);
      } else {
        alert('PW 변경 성공');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error resetting password', error);
      alert('없는 회원입니다.');
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.resetPasswordBox}>
        <h1 className={styles.title}>PW 초기화</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Contact Without '-'"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.inputField}
          />
          <button type="submit" className={styles.resetButton}>Reset Password</button>
        </form>
      </div>
    </div>
  );
}
