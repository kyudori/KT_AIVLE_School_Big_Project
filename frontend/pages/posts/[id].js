import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../../styles/PostDetail.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState({ content: '', is_public: true });
  const [editingComment, setEditingComment] = useState(null);
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
    const { name, value, type, checked } = e.target;
    setNewComment({ ...newComment, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Token ${token}` };

    if (editingComment) {
      axios.put(`${BACKEND_URL}/api/comments/${editingComment.id}/`, newComment, { headers })
        .then(() => {
          fetchPost(id);
          setNewComment({ content: '', is_public: true });
          setEditingComment(null);
        })
        .catch(error => console.error('Error editing comment', error));
    } else {
      axios.post(`${BACKEND_URL}/api/posts/${id}/comments/`, newComment, { headers })
        .then(() => {
          fetchPost(id);
          setNewComment({ content: '', is_public: true });
        })
        .catch(error => console.error('Error posting comment', error));
    }
  };

  const handleCommentEdit = (comment) => {
    setNewComment({ content: comment.content, is_public: comment.is_public });
    setEditingComment(comment);
  };

  const handleCommentDelete = (commentId) => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Token ${token}` };

    axios.delete(`${BACKEND_URL}/api/comments/${commentId}/`, { headers })
      .then(() => fetchPost(id))
      .catch(error => console.error('Error deleting comment', error));
  };

  const handlePostEdit = () => {
    router.push(`/write?id=${post.id}`);
  };

  const handlePostDelete = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Token ${token}` };

    axios.delete(`${BACKEND_URL}/api/posts/${id}/`, { headers })
      .then(() => router.push('/contact'))
      .catch(error => console.error('Error deleting post', error));
  };

  const handleBackClick = () => {
    router.push('/contact');
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <button onClick={handleBackClick} className={styles.backButton}>글 목록으로 가기</button>
        <h1 className={post.is_notice ? styles.noticeTitle : ''}>{post.title}</h1>
        <div className={styles.meta}>
          <span>By {post.author_name}</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
          <span>Views: {post.views}</span>
          {user && (user.is_staff || user.id === post.author_id) && (
            <div className={styles.actions}>
              <button onClick={handlePostEdit}>Edit</button>
              <button onClick={handlePostDelete}>Delete</button>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <p>{post.content}</p>
        </div>
        <div className={styles.commentsSection}>
          <h2>Comments</h2>
          {post.comments.map(comment => (
            <div key={comment.id} className={`${styles.comment} ${comment.author_name === '관리자' ? styles.adminComment : ''}`}>
              {editingComment && editingComment.id === comment.id ? (
                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                  <textarea 
                    name="content" 
                    value={newComment.content} 
                    onChange={handleCommentChange} 
                    required 
                  ></textarea>
                  <label>
                    <input 
                      type="checkbox" 
                      name="is_public" 
                      checked={newComment.is_public} 
                      onChange={handleCommentChange} 
                    /> 전체 공개
                  </label>
                  <button type="submit">Update Comment</button>
                  <button type="button" onClick={() => setEditingComment(null)}>Cancel</button>
                </form>
              ) : (
                <div>
                  <p>{comment.content}</p>
                  <div className={styles.meta}>
                    <span>By {comment.author_name}</span>
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                    {user && (user.is_staff || user.id === comment.author_id) && (
                      <div className={styles.actions}>
                        <button onClick={() => handleCommentEdit(comment)}>Edit</button>
                        <button onClick={() => handleCommentDelete(comment.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {user && !editingComment && (
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <textarea 
                name="content" 
                value={newComment.content} 
                onChange={handleCommentChange} 
                placeholder="Add a comment" 
                required 
              ></textarea>
              <label>
                <input 
                  type="checkbox" 
                  name="is_public" 
                  checked={newComment.is_public} 
                  onChange={handleCommentChange} 
                /> 전체 공개
              </label>
              <button type="submit">Post Comment</button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
