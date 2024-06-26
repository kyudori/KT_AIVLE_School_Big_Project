import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function UserInfo() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}api/user-info/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        setUser(response.data);
        setUsername(response.data.name);
        setCompany(response.data.company);
        setContact(response.data.contact);
      })
      .catch(error => {
        console.error('Error fetching user info', error);
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !contact) {
      alert('Username and Contact fields cannot be empty');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${BACKEND_URL}api/user-info/`, {
        name: username,
        company: company,
        contact: contact
      }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      alert('User info updated successfully');
    } catch (error) {
      console.error('Error updating user info', error);
      alert('Error updating user info');
    }
  };

  const handlePasswordChange = () => {
    router.push('/change-password');
  };

  return (
    <div>
      <Navbar />
      <h1>User Info</h1>
      {user ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email: {user.email}</label>
          </div>
          <div>
            <label>Username:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>
          <div>
            <label>Company:</label>
            <input 
              type="text" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
            />
          </div>
          <div>
            <label>Contact:</label>
            <input 
              type="text" 
              value={contact} 
              onChange={(e) => setContact(e.target.value)} 
              required
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={handlePasswordChange}>Change Password</button>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
