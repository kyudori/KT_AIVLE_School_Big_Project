import React from 'react';
import styles from '../styles/Plan.module.css';
import axios from 'axios';
import { useRouter } from 'next/router';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PlanCard = ({ plan }) => {
  const router = useRouter();

  const handlePayment = async (price, planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/create/`,
        { plan_id: planId },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      const { next_redirect_pc_url } = response.data;
      window.location.href = next_redirect_pc_url;
    } catch (error) {
      console.error('결제 요청 실패:', error);
      alert('결제 요청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.planCard}>
      <h2>{plan.name}</h2>
      {plan.options ? (
        plan.options.map((option, index) => (
          <div key={index} className={styles.option}>
            <p>{(option.price).toLocaleString('ko-KR')}원 / {option.credits} Credit 구매</p>
            <button onClick={() => handlePayment(option.price, plan.id)}>Buy Now</button>
          </div>
        ))
      ) : (
        <>
          <p>{(plan.price).toLocaleString('ko-KR')}원</p>
          <button onClick={() => handlePayment(plan.price, plan.id)}>Buy Now</button>
        </>
      )}
      <p>{plan.description}</p>
    </div>
  );
};

export default PlanCard;
