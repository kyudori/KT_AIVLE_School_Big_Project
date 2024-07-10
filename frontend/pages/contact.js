import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Contact.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Contact() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPosts(page);
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}/api/user-info/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching user info', error));
    }
  }, [page]);

  const fetchPosts = (page) => {
    axios.get(`${BACKEND_URL}/api/posts/?page=${page}`)
      .then(response => {
        setPosts(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      })
      .catch(error => console.error('Error fetching posts', error));
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <h1>Contact Us</h1>
        {user && (
          <div className={styles.writeButtonContainer}>
            <Link href="/write">
              <button className={styles.writeButton}>글쓰기</button>
            </Link>
          </div>
        )}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No</th>
              <th>제목</th>
              <th>글쓴이</th>
              <th>작성시간</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post.id} onClick={() => router.push(`/posts/${post.id}`)} className={post.is_notice ? styles.noticeRow : ''}>
                <td>{(page - 1) * 10 + index + 1}</td>
                <td>{post.title}</td>
                <td>{post.author_name}</td>
                <td>{new Date(post.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
            <button
              key={pageNumber}
              className={styles.pageButton}
              onClick={() => setPage(pageNumber)}
              disabled={pageNumber === page}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
