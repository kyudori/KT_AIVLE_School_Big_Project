import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Signup.module.css';

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
      alert('You are already logged in');
      router.push('/home');
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username) {
      alert('Username is required');
      document.getElementById('username').focus();
      return;
    }
    if (!email) {
      alert('Email is required');
      document.getElementById('email').focus();
      return;
    }
    if (!contact) {
      alert('Contact is required');
      document.getElementById('contact').focus();
      return;
    }
    if (!password) {
      alert('Password is required');
      document.getElementById('password').focus();
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      setPassword('');
      setConfirmPassword('');
      document.getElementById('password').focus();
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}/api/signup/`, { username, email, password, company, contact });
      localStorage.setItem('token', response.data.token);
      alert('Signup successful');
      router.push('/home');
    } catch (error) {
      if (error.response && error.response.data.error === 'Email already exists') {
        alert('Email already exists');
        setEmail('');
        document.getElementById('email').focus();
      }
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.signupBox}>
        <h1 className={styles.title}>회원가입</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.inputField}
          />
          <input
            type="email"
            placeholder="Email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Contact (without '-')"
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.inputField}
          />
          <button type="submit" className={styles.signupButton}>Signup</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
