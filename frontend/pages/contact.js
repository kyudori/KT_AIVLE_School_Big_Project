import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Contact.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Contact() {
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axios.get(`${BACKEND_URL}/api/posts/`)
      .then(response => setPosts(response.data.results))
      .catch(error => console.error('Error fetching posts', error));
  };

  const handleWriteClick = () => {
    router.push('/write');
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1>Contact Us</h1>
        <button onClick={handleWriteClick} className={styles.writeButton}>글쓰기</button>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No</th>
              <th>제목</th>
              <th>글쓴이</th>
              <th>작성시간</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr 
                key={post.id} 
                onClick={() => router.push(`/posts/${post.id}`)} 
                className={post.is_notice ? styles.notice : ''}
              >
                <td>{index + 1}</td>
                <td>{post.title}</td>
                <td>{post.author_name}</td>
                <td>{new Date(post.created_at).toLocaleString()}</td>
                <td>{post.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
}
