import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to access this page');
      router.push('/login');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${BACKEND_URL}api/change-password/`, {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      alert('Password changed successfully');
      router.push('/user-info');
    } catch (error) {
      console.error('Error changing password', error);
      if (error.response && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Error changing password');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <h1>Change Password</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Current Password:</label>
          <input 
            type="password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>New Password:</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Confirm New Password:</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}
