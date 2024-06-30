import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import styles from '../styles/Setting.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Setting() {
  const [credits, setCredits] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiKeyIssued, setApiKeyIssued] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}/api/get-credits/`, {
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

      axios.get(`${BACKEND_URL}/api/user-info/`, {
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
      const response = await axios.post(`${BACKEND_URL}/api/${action}/`, { password }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setApiKey(response.data.api_key || '');
      setApiKeyIssued(true);
      alert(`${action === 'get-api-key' ? 'API key issued' : action === 'regenerate-api-key' ? 'API key regenerated' : 'API key deleted'} successfully`);
    } catch (error) {
      console.error(`Error ${action} API key`, error);
      alert(`Error ${action} API key`);
    }
  };

  const handleTryVoiceVerity = () => {
    router.push('/try');
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.settingBox}>
        <h1 className={styles.title}>환경설정</h1>
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
                  className={styles.inputField}
                />
              </label>
              {!apiKey ? (
                <button onClick={() => handleApiKeyAction('get-api-key')} className={styles.button}>발급</button>
              ) : (
                <>
                  <button onClick={() => handleApiKeyAction('regenerate-api-key')} className={styles.button}>재 발급</button>
                  <button onClick={() => handleApiKeyAction('delete-api-key')} className={styles.button}>API-Key 삭제</button>
                </>
              )}
            </div>
            {apiKey && (
              <div>
                <p>API Key: {apiKey}</p>
              </div>
            )}
            {apiKeyIssued && (
              <button onClick={handleTryVoiceVerity} className={styles.button}>Try Voice Verity</button>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
