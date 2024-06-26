import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

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
    <div>
      <Navbar />
      <h1>Try Voice Verity</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {result && (
        <div>
          <h2>Analysis Result:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
