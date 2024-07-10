import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../styles/Myplan.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const MyPlan = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [nextPaymentDate, setNextPaymentDate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem("token");
        const plansResponse = await axios.get(`${BACKEND_URL}/api/subscription-plans/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setPlans(plansResponse.data);
        
        const currentPlanResponse = await axios.get(`${BACKEND_URL}/api/user/current-plan/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setCurrentPlan(currentPlanResponse.data.plan);
        setNextPaymentDate(currentPlanResponse.data.next_payment_date);
      } catch (error) {
        console.error("Error fetching plans", error);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanClick = (plan) => {
    if (plan.id === currentPlan.id) {
      alert("현재 구독 중인 플랜입니다.");
    } else if (plan.id < currentPlan.id) {
      alert("현재 구독 중인 플랜이 더 좋은 플랜입니다.");
    } else {
      if (confirm(`현재 플랜을 ${plan.name}(으)로 변경하시겠습니까?`)) {
        // 플랜 변경 로직 구현
      }
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.userInfo}>
          <div className={styles.userIcon} />
          <div>
            <h2>User Name</h2>
            <p>현재 구독플랜</p>
          </div>
          <p>다음 결제일 : {nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString() : "정보 없음"}</p>
        </div>
        <div className={styles.plans}>
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`${styles.planCard} ${plan.id === currentPlan?.id ? styles.currentPlan : ""}`}
              onClick={() => handlePlanClick(plan)}
            >
              <h2>{plan.name}</h2>
              <p>{plan.price.toLocaleString("ko-KR")} / {plan.is_recurring ? "월" : "회"}</p>
              <ul>
                <li>{plan.description}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.contactUs}>
        <h2>Voice Verity와 함께해요.</h2>
        <p>당신의 든든한 파트너가 될 수 있습니다.</p>
        <button onClick={() => router.push("/contact")}>Contact Us</button>
      </div>
      <Footer />
    </div>
  );
};

export default MyPlan;
