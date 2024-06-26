import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import styles from '../styles/Try.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function TryVoice() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to access this page');
      router.push('/login');
    }
  }, [router]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}api/upload-audio/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        }
      });
      const analysisResult = response.data.analysis_result;
      const message = analysisResult === 1 ? '음성 파일입니다.' : '음성 파일이 아닙니다.';
      setResult(message);
    } catch (error) {
      console.error('Error uploading file', error);
      alert('Error uploading file');
    }
  };

  return (
    <div className={styles.previewContext}>
      <Navbar />
      <h1>Try Voice Verity</h1>
      <h2>Upload your voice</h2>
      <div className={styles.fileupload}>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Upload</button>
        </form>
        <div className={styles.resultContext}>
          {result && (
          <div>
            <h2>Analysis Result:</h2>
            <p>{result}</p>
          </div>
          )}
        </div>
      </div>
      <footer className={styles.foot}>
        <p className={styles.end}>신기한 스쿨버스</p>
          <ul className={styles.terms}>
            <li>서비스 약관</li>
            <hr></hr>
            <li>운영약관</li>
            <hr></hr>
            <li>개인정보보호약관</li>
          </ul>
      </footer>
    </div>
  );
}
