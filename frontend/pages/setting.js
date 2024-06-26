import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router'; // Next.js의 useRouter를 import 합니다.

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Setting() {
  const [credits, setCredits] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiKeyIssued, setApiKeyIssued] = useState(false); // API 키 발급 여부 상태 추가
  const router = useRouter(); // Next.js의 useRouter 사용

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}api/get-credits/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        setCredits(response.data.credits);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching credits', error);
      });

      axios.get(`${BACKEND_URL}api/user-info/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        setApiKey(response.data.api_key);
      })
      .catch(error => {
        console.error('Error fetching API key', error);
      });
    }
  }, []);

  const handleApiKeyAction = async (action) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${BACKEND_URL}api/${action}/`, { password }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setApiKey(response.data.api_key || '');
      setApiKeyIssued(true); // API 키가 발급되었음을 표시
      alert(`${action === 'get-api-key' ? 'API key issued' : action === 'regenerate-api-key' ? 'API key regenerated' : 'API key deleted'} successfully`);
    } catch (error) {
      console.error(`Error ${action} API key`, error);
      alert(`Error ${action} API key`);
    }
  };

  const handleTryVoiceVerity = () => {
    router.push('/try'); // /try 경로로 이동
  };

  return (
    <div>
      <Navbar />
      <h1>환경설정</h1>
      {loading ? <p>Loading...</p> : (
        <div>
          <p>Credits: {credits}</p>
          <div>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {!apiKey ? (
              <button onClick={() => handleApiKeyAction('get-api-key')}>발급</button>
            ) : (
              <>
                <button onClick={() => handleApiKeyAction('regenerate-api-key')}>재 발급</button>
                <button onClick={() => handleApiKeyAction('delete-api-key')}>API-Key 삭제</button>
              </>
            )}
          </div>
          {apiKey && (
            <div>
              <p>API Key: {apiKey}</p>
            </div>
          )}
          {apiKeyIssued && ( // API 키가 발급되었을 때 Try Voice Verity 버튼을 추가합니다.
            <button onClick={handleTryVoiceVerity}>Try Voice Verity</button>
          )}
        </div>
      )}
    </div>
  );
}
