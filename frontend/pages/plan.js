import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import PlanCard from '../components/plancard';
import styles from '../styles/Plan.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const plans = [
  {
    id: 1,
    name: 'Pay As You Go',
    options: [
      { price: 9990, credits: 10 },
      { price: 45990, credits: 65 }
    ],
    description: '구독이 필요하지 않습니다. 사용할 만큼만 비용을 지불하세요. 오래 사용할 수 있습니다. 90일 동안 자유롭게 사용하세요.',
  },
  {
    id: 2,
    name: 'Basic',
    price: 9000,
    dailyCalls: 10,
    description: '0.9$ / 1회 30일 구독 상품',
  },
  {
    id: 3,
    name: 'Associate',
    price: 29000,
    dailyCalls: 50,
    description: '0.58$ / 1회 30일 구독 상품',
  },
  {
    id: 4,
    name: 'Professional',
    price: 79000,
    dailyCalls: 200,
    description: '0.39$ / 1회 30일 구독 상품',
  }
];

const Plans = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}/api/user-info/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error('Error fetching user info', error);
        });
    }
  }, []);

  const handlePayment = async (price, planId) => {
    try {
      const token = localStorage.getItem('token');
      // 사용자 정보 가져오기
      if (token) {
        const userResponse = await axios.get(`${BACKEND_URL}/api/user-info/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setUser(userResponse.data);

        // 결제 요청 보내기
        const response = await axios.post(
          `${BACKEND_URL}/api/payments/create/`,
          { plan_id: planId },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
            withCredentials: true, // 세션 인증을 위해 필요
          }
        );
        const { next_redirect_pc_url } = response.data;
        window.location.href = next_redirect_pc_url;
      }
    } catch (error) {
      console.error('결제 요청 실패:', error);
      alert('결제 요청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <h1>Voice Verity</h1>
        <p>Voice Verity에서는 실시간 통화 중 담보이스를 감지할 수 있습니다. 내게 맞는 Voice Verity 요금제를 선택하세요.</p>
        <div className={styles.plansContainer}>
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} handlePayment={handlePayment} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Plans;
