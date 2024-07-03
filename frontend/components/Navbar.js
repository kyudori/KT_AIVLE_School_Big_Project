import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from './Navbar.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
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
        console.error('Error fetching user info', error);
      });
    }
  }, []);

  const handleLogout = () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      localStorage.removeItem('token');
      setUser(null);
      router.push('/home');
    }
  };

  return (
    <nav className={styles.nav}>
      <Link href="/home" className={styles.brand}>Voice Verity</Link>
      <div className={styles.rightMenu}>
        {user ? (
          <div className={styles.userSection}>
            <div className={styles.navLinks}>
              {user && user.is_staff && <a href={`${BACKEND_URL}/admin`} target="_blank" rel="noopener noreferrer">Admin</a>}
              <Link href="/api-status">API</Link>
              <Link href="/team">Team</Link>
              <Link href="/docs">Docs</Link>
            </div>
            <div onClick={() => setDropdownVisible(!dropdownVisible)} className={styles.userInfo}>
              <span>{user.email}님</span>
              <div className={styles.triangle}></div>
              <div className={`${styles.dropdown} ${dropdownVisible ? styles.show : ''}`}>
                <button>내 정보<Link href="/user-info" /></button>
                <button>내 구독<Link href="/plan" /></button>
                <button onClick={handleLogout}>로그아웃</button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.navLinks}>
            <Link href="/api-status">API</Link>
            <Link href="/team">Team</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/login">Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
