import axios from 'axios';
import Navbar from '../components/Navbar';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js'; 
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

Chart.register(CategoryScale);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ApiStatus() {
  const [weeklyUsage, setWeeklyUsage] = useState([]);
  const [groupUsage, setGroupUsage] = useState([]);
  const [userFiles, setUserFiles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to access this page');
      router.push('/login');
    } else {
      axios.get(`${BACKEND_URL}api/api-usage-weekly/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        setWeeklyUsage(response.data);
      })
      .catch(error => {
        console.error('Error fetching weekly usage', error);
      });

      axios.get(`${BACKEND_URL}api/group-usage/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        setGroupUsage(response.data);
      })
      .catch(error => {
        console.error('Error fetching group usage', error);
      });

      axios.get(`${BACKEND_URL}api/user-files/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        setUserFiles(response.data);
      })
      .catch(error => {
        console.error('Error fetching user files', error);
      });
    }
  }, [router]);

  const weeklyData = {
    labels: weeklyUsage.map(data => data.upload_date),
    datasets: [
      {
        label: 'Weekly Usage',
        data: weeklyUsage.map(data => data.total_uploads),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  const groupData = {
    labels: groupUsage.map(data => data.user__company),
    datasets: [
      {
        label: 'Group Usage',
        data: groupUsage.map(data => data.total_uploads),
        fill: false,
        backgroundColor: 'rgba(153,102,255,0.2)',
        borderColor: 'rgba(153,102,255,1)',
      },
    ],
  };

  const options = {
    maintainAspectRatio: false, 
    responsive: true,
  };

  return (
    <div>
      <Navbar />
      <h1>API Status</h1>
      <h2>Weekly API Usage</h2>
      <div style={{ height: '300px', width: '600px' }}>
        <Line data={weeklyData} options={options} />
      </div>
      <h2>Group API Usage</h2>
      <div style={{ height: '300px', width: '600px' }}>
        <Line data={groupData} options={options} />
      </div>
      <h2>User Files</h2>
      <ul>
        {userFiles.map((file, index) => (
          <li key={index}>
            {file.file_name}: {file.file_path} - {file.analysis_result}
          </li>
        ))}
      </ul>
    </div>
  );
}
