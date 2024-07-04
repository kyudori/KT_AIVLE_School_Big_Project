import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Dashboard.module.css';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.js 구성 요소 등록
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const userData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Monthly Active Users',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      backgroundColor: 'rgba(75,192,192,0.2)',
      borderColor: 'rgba(75,192,192,1)',
    },
  ],
};

const signUpData = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: 'User Signups',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
    },
  ],
};

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Voice Verity" />
        </div>
        <div className={styles.menu}>
          <a href="#">Dashboard</a>
        </div>
      </div>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1>API Dashboard</h1>
          <div className={styles.userInfo}>
            <p>Welcome! John Doe!</p>
            <div className={styles.userProfile}>
              <img src="/user-placeholder.png" alt="User Profile" />
              <div>
                <p>John Doe</p>
                <p>john.doe@example.com</p>
              </div>
            </div>
          </div>
        </header>
        <main className={styles.main}>
          <section className={styles.chartSection}>
            <div className={styles.chartContainer}>
              <Line data={userData} />
            </div>
          </section>
          <section className={styles.chartSection}>
            <div className={styles.chartContainer}>
              <Bar data={signUpData} />
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
