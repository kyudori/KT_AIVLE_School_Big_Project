import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from '../styles/Planafter.module.css';

const PlanFail = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <h1>결제 실패</h1>
        <p>결제에 실패했습니다.</p>
        <Link href="/plan">
          <button className={styles.button}>Go back to Plans</button>
        </Link>
      </div>
      <div className={styles.contactUs}>
        <h2>Contact Us</h2>
        <Link href="/contact">
          <button className={styles.button}>Contact Support</button>
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default PlanFail;
