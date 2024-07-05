import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PlanCancel = () => {
  return (
    <div>
      <Navbar />
      <div>
        <h1>Payment Canceled</h1>
        <p>Your payment was canceled.</p>
        <Link href="/plan">Go back to Plans</Link>
      </div>
      <Footer />
    </div>
  );
};

export default PlanCancel;

