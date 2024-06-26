import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from './Navbar.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}api/user-info/`, {
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
      {user && user.is_staff && <a href={`${BACKEND_URL}admin`} target="_blank" rel="noopener noreferrer">Admin</a>}
      <Link href="/api-status">API</Link>
      <Link href="/team">팀 소개</Link>
      <Link href="/docs">문서</Link>
      {user ? (
        <div className={styles.userMenu}>
          <span>{user.email} 님</span>
          <div className={styles.dropdown}>
            <Link href="/user-info">내 정보</Link>
            <Link href="/setting">환경설정</Link>
            <button onClick={handleLogout}>로그아웃</button>
          </div>
        </div>
      ) : (
        <Link href="/login">로그인</Link>
      )}
    </nav>
  );
}
