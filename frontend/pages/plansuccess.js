import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
    <div>
      <Navbar />
      <div>
        <h1>Payment Success</h1>
        {paymentDetails ? (
          <div>
            <p>Your payment was successful.</p>
            <p>Plan: {paymentDetails.plan_name}</p>
            <p>Amount: {paymentDetails.amount.toLocaleString('ko-KR')}원</p>
            <p>Date: {new Date(paymentDetails.payment_date).toLocaleString()}</p>
          </div>
        ) : (
          <p>Loading your payment details...</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PlanSuccess;
