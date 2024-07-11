import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/Contact.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Contact() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${BACKEND_URL}/api/user-info/`, {
          headers: { Authorization: `Token ${token}` },
        })
        .then((response) => setUser(response.data))
        .catch((error) => console.error("Error fetching user info", error));
    }
  }, []);

  const fetchPosts = () => {
    axios
      .get(`${BACKEND_URL}/api/posts/`)
      .then((response) => setPosts(response.data.results))
      .catch((error) => console.error("Error fetching posts", error));
  };

  const handleWriteClick = () => {
    if (!user) {
      alert("로그인 후 이용해 주세요.");
      return;
    }
    router.push("/write");
  };

  return (
    <div className={styles.container}>
      <div style={{ padding: "0 200px", background: "#fff" }}>
        <Navbar />
      </div>
      <div className={styles.head}>
        <h1>Contact Us</h1>
      </div>
      <div className={styles.content}>
        <button onClick={handleWriteClick} className={styles.writeButton}>
          글쓰기
        </button>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{width:'10%'}}>No</th>
              <th style={{width:'50%'}}>제목</th>
              <th>글쓴이</th>
              <th style={{width:'10%'}}>작성시간</th>
              <th style={{width:'10%'}}>조회수</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr
                key={post.id}
                onClick={() => router.push(`/posts/${post.id}`)}
                className={post.is_notice ? styles.notice : ""}
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
      <div style={{ height: "100px" }} />
      <Footer />
    </div>
  );
}
