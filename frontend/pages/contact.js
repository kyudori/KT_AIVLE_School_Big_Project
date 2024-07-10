import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Contact.module.css';
import { useRouter } from 'next/router';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Contact() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', is_notice: false, is_public: true });
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}/api/user-info/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching user info', error));
    }
  }, []);

  const fetchPosts = () => {
    axios.get(`${BACKEND_URL}/api/posts/`)
      .then(response => setPosts(response.data))
      .catch(error => console.error('Error fetching posts', error));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPost({ ...newPost, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Token ${token}` };

    if (isEditing) {
      axios.put(`${BACKEND_URL}/api/posts/${editingPostId}/`, newPost, { headers })
        .then(() => {
          fetchPosts();
          resetForm();
        })
        .catch(error => console.error('Error editing post', error));
    } else {
      axios.post(`${BACKEND_URL}/api/posts/`, newPost, { headers })
        .then(() => {
          fetchPosts();
          resetForm();
        })
        .catch(error => console.error('Error creating post', error));
    }
  };

  const resetForm = () => {
    setNewPost({ title: '', content: '', is_notice: false, is_public: true });
    setIsEditing(false);
    setEditingPostId(null);
  };

  const handleEdit = (post) => {
    setNewPost({ title: post.title, content: post.content, is_notice: post.is_notice, is_public: post.is_public });
    setIsEditing(true);
    setEditingPostId(post.id);
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Token ${token}` };

    axios.delete(`${BACKEND_URL}/api/posts/${id}/`, { headers })
      .then(fetchPosts)
      .catch(error => console.error('Error deleting post', error));
  };

  const handlePostClick = (id) => {
    router.push(`/posts/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Navbar />
        <div className={styles.main}>
          <h1>Contact Us</h1>
          {user ? (
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
              {user.is_staff && (
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
              <button type="submit">{isEditing ? 'Update' : 'Post'}</button>
            </form>
          ) : (
            <p>로그인 후 글을 작성할 수 있습니다.</p>
          )}
          <div className={styles.posts}>
            {posts.map(post => (
              <div key={post.id} className={`${styles.post} ${post.is_notice ? styles.notice : ''}`} onClick={() => handlePostClick(post.id)}>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <div className={styles.meta}>
                  <span>By {post.author_name}</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                  <span>Views: {post.views}</span>
                </div>
                {user && (user.is_staff || user.id === post.author) && (
                  <div className={styles.actions}>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(post); }}>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}>Delete</button>
                  </div>
                )}
                <div className={styles.comments}>
                  {post.comments.map(comment => (
                    <div key={comment.id} className={styles.comment}>
                      <p>{comment.content}</p>
                      <div className={styles.meta}>
                        <span>By {comment.author_name}</span>
                        <span>{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
