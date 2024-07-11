import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Write.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Write() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isNotice, setIsNotice] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    fetchUser();
    if (id) {
      setIsEditMode(true);
      fetchPost(id);
    }
  }, [id]);

  const fetchUser = () => {
    const token = localStorage.getItem('token');
    axios.get(`${BACKEND_URL}/api/user-info/`, {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(response => {
      setIsAdmin(response.data.is_staff);
    })
    .catch(error => console.error('Error fetching user info', error));
  };

  const fetchPost = (id) => {
    const token = localStorage.getItem('token');
    axios.get(`${BACKEND_URL}/api/posts/${id}/`, {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(response => {
      const post = response.data;
      setTitle(post.title);
      setContent(post.content);
      setIsNotice(post.is_notice);
    })
    .catch(error => console.error('Error fetching post', error));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = { title, content, is_notice: isNotice };
    const headers = { 'Authorization': `Token ${token}` };

    if (isEditMode) {
      axios.put(`${BACKEND_URL}/api/posts/${id}/`, data, { headers })
        .then(() => router.push(`/posts/${id}`))
        .catch(error => console.error('Error updating post', error));
    } else {
      axios.post(`${BACKEND_URL}/api/posts/`, data, { headers })
        .then(response => router.push(`/posts/${response.data.id}`))
        .catch(error => console.error('Error creating post', error));
    }
  };

  const handleCancel = () => {
    router.push('/contact');
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1>{isEditMode ? 'Edit Post' : 'Write a Post'}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input 
            type="text" 
            placeholder="Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
          <textarea 
            placeholder="Content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
          {isAdmin && (
            <label>
              <input 
                type="checkbox" 
                checked={isNotice} 
                onChange={(e) => setIsNotice(e.target.checked)} 
              /> 공지사항
            </label>
          )}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.button}>{isEditMode ? 'Update' : 'Submit'}</button>
            <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}