import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../../styles/PostDetail.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}/api/user-info/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching user info', error));
    }
  }, [id]);

  const fetchPost = (id) => {
    axios.get(`${BACKEND_URL}/api/posts/${id}/`)
      .then(response => setPost(response.data))
      .catch(error => console.error('Error fetching post', error));
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Token ${token}` };
    
    axios.post(`${BACKEND_URL}/api/posts/${id}/comments/`, { content: newComment }, { headers })
      .then(() => {
        fetchPost(id);
        setNewComment('');
      })
      .catch(error => console.error('Error posting comment', error));
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <h1>{post.title}</h1>
        <div className={styles.meta}>
          <span>By {post.author_name}</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
          <span>Views: {post.views}</span>
        </div>
        <div className={styles.content}>
          <p>{post.content}</p>
        </div>
        <div className={styles.commentsSection}>
          <h2>Comments</h2>
          {post.comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <p>{comment.content}</p>
              <div className={styles.meta}>
                <span>By {comment.author_name}</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {user && (
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <textarea 
                name="comment" 
                value={newComment} 
                onChange={handleCommentChange} 
                placeholder="Add a comment" 
                required 
              ></textarea>
              <button type="submit">Post Comment</button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
