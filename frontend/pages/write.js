import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Write.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Write() {
  const [newPost, setNewPost] = useState({ title: '', content: '', is_notice: false, is_public: true });
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}/api/user-info/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching user info', error));
    } else {
      router.push('/login');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPost({ ...newPost, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Token ${token}` };

    axios.post(`${BACKEND_URL}/api/posts/`, newPost, { headers })
      .then(() => router.push('/contact'))
      .catch(error => console.error('Error creating post', error));
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <h1>글쓰기</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input 
            type="text" 
            name="title" 
            value={newPost.title} 
            onChange={handleInputChange} 
            placeholder="Title" 
            required 
          />
          <textarea 
            name="content" 
            value={newPost.content} 
            onChange={handleInputChange} 
            placeholder="Content" 
            required 
          ></textarea>
          {user && user.is_staff && (
            <label>
              <input 
                type="checkbox" 
                name="is_notice" 
                checked={newPost.is_notice} 
                onChange={handleInputChange} 
              /> 공지사항으로 설정
            </label>
          )}
          <label>
            <input 
              type="checkbox" 
              name="is_public" 
              checked={newPost.is_public} 
              onChange={handleInputChange} 
            /> 전체 공개
          </label>
          <button type="submit">Post</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
