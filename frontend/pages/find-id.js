import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import styles from '../styles/FindId.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function FindId() {
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [users, setUsers] = useState([]);
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
    if (!username || !contact) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}api/find-id/`, { username, contact });
      if (response.data.error) {
        alert(response.data.error);
      } else {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error finding ID', error);
      alert('없는 회원입니다.');
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.findIdBox}>
        <h1 className={styles.title}>ID 찾기</h1>
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
            type="text"
            placeholder="Contact Without '-' "
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className={styles.inputField}
          />
          <button type="submit" className={styles.findButton}>Find ID</button>
        </form>
        {users.length > 0 && (
          <div className={styles.userList}>
            <h2>Users found:</h2>
            <ul>
              {users.map((user, index) => (
                <li key={index}>
                  Email: {user.email} <br />
                  Joined Date: {new Date(user.date_joined).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
