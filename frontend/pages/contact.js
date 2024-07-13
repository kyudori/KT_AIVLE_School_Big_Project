import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/Contact.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Contact() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [searchOption, setSearchOption] = useState('title');
  const [searchInitiated, setSearchInitiated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPosts(currentPage, query, searchOption);
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${BACKEND_URL}/api/user-info/`, {
          headers: { Authorization: `Token ${token}` },
        })
        .then((response) => setUser(response.data))
        .catch((error) => console.error("Error fetching user info", error));
    }
  }, [currentPage]);

  const fetchPosts = (page, query, searchOption) => {
    axios
      .get(`${BACKEND_URL}/api/posts/`, {
        params: { page, query, searchOption }
      })
      .then((response) => {
        setPosts(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      })
      .catch((error) => console.error("Error fetching posts", error));
  };

  const handleWriteClick = () => {
    if (!user) {
      alert("로그인 후 이용해 주세요.");
      return;
    }
    router.push("/write");
  };

  const handlePostClick = (post) => {
    if (!post.is_public && (!user || (user.id !== post.author_id && !user.is_staff))) {
      alert("비공개 게시글입니다.");
      return;
    }
    router.push(`/posts/${post.id}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPosts(page, query, searchOption);
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearchOptionChange = (e) => {
    setSearchOption(e.target.value);
  };

  const handleSearchClick = () => {
    setSearchInitiated(true);
    setCurrentPage(1);
    fetchPosts(1, query, searchOption);
  };

  return (
    <div className={styles.container}>
      <div style={{ padding: "0 200px", background: "#fff" }}>
        <Navbar />
      </div>
      <div className={styles.head}>
        <h1>Contact Us</h1>
        <div className={styles.searchContainer}>
          <select value={searchOption} onChange={handleSearchOptionChange} className={styles.searchSelect}>
            <option value="title">제목</option>
            <option value="author">글쓴이</option>
          </select>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={query}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <button onClick={handleSearchClick} className={styles.searchButton}>검색</button>
        </div>
      </div>
      <div className={styles.content}>
        <button onClick={handleWriteClick} className={styles.writeButton}>
          글쓰기
        </button>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>No</th>
              <th style={{ width: '50%' }}>제목</th>
              <th>글쓴이</th>
              <th style={{ width: '10%' }}>작성시간</th>
              <th style={{ width: '10%' }}>조회수</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && searchInitiated ? (
              <tr>
                <td colSpan="5">일치하는 결과가 없습니다.</td>
              </tr>
            ) : (
              posts.map((post, index) => (
                <tr
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className={post.is_notice ? styles.notice : ""}
                >
                  <td>{(currentPage - 1) * 10 + index + 1}</td>
                  <td>
                    {post.is_notice && <span>&lt;공지&gt; </span>}
                    {post.title}
                    {!post.is_public && <span> (비공개)</span>}
                  </td>
                  <td>{post.author_name}</td>
                  <td style={{ fontSize: '12px' }}>{new Date(post.created_at).toLocaleString()}</td>
                  <td>{post.views}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={i + 1 === currentPage ? styles.active : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: "100px" }} />
      <Footer />
    </div>
  );
}
