import Navbar from '../components/Navbar';
import styles from '../styles/Team.module.css';

export default function Team() {
  return (
    <div className={styles.teamContainer}>
      <Navbar />
      <div className={styles.content}>
        <h1>팀 소개</h1>
        <p>AIVLE School Big Project 8조</p>
        <ul className={styles.teamList}>
          <li>문동규 - Team Leader, Model</li>
          <li>김성규 - Model</li>
          <li>김아영 - FrontEnd</li>
          <li>박성훈 - Data Collection and Preprocessing</li>
          <li>박종범 - Model</li>
          <li>정주영 - Planning, Server</li>
          <li>하세호 - Data Collection and Preprocessing</li>
          <li>한규현 - BackEnd</li>
        </ul>
      </div>
    </div>
  );
}
