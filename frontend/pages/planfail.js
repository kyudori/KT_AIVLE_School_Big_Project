import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Planafter.module.css';

const PlanFail = () => {
  return (
    <div className="container">
      <Navbar />
      <div className="main">
        <h1>Payment Failed</h1>
        <p>There was an issue with your payment.</p>
        <Link href="/plan">Go back to Plans</Link>
      </div>
      <Footer />
    </div>
  );
};

export default PlanFail;
