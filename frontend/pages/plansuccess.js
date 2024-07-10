import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import styles from '../styles/Planafter.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PlanSuccess = () => {
  const router = useRouter();
  const { pg_token } = router.query;
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const approvePayment = async () => {
      const token = localStorage.getItem('token');
      if (pg_token && token) {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/payments/approval/`, {
            params: { pg_token },
            headers: {
              Authorization: `Token ${token}`,
            },
            withCredentials: true, // 세션 인증을 위해 필요
          });
          setPaymentDetails(response.data);
        } catch (error) {
          console.error('Failed to approve payment:', error);
          router.push('/planfail'); // 결제 실패 페이지로 이동
        }
      }
    };

    approvePayment();
  }, [pg_token, router]);

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <h1>결제 성공</h1>
        {paymentDetails ? (
          <div>
            <p>결제가 완료되었어요.</p>
            <p>Plan: {paymentDetails.plan_name}</p>
            {paymentDetails.amount !== undefined && (
              <p>Amount: {paymentDetails.amount.toLocaleString('ko-KR')}원</p>
            )}
            {paymentDetails.payment_date && (
              <p>Date: {new Date(paymentDetails.payment_date).toLocaleString()}</p>
            )}
            <Link href="/docs">
              <button className={styles.button}>Go to Docs</button>
            </Link>
          </div>
        ) : (
          <p>Loading your payment details...</p>
        )}
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

export default PlanSuccess;
