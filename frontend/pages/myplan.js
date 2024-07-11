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
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user, setUser] = useState({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem("token");
        const plansResponse = await axios.get(`${BACKEND_URL}/api/subscription-plans/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setPlans(plansResponse.data);
        
        const currentPlanResponse = await axios.get(`${BACKEND_URL}/api/current-plan/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setCurrentPlan(currentPlanResponse.data.plan);
        setNextPaymentDate(currentPlanResponse.data.next_payment_date);

        const userInfoResponse = await axios.get(`${BACKEND_URL}/api/user-info/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setUser(userInfoResponse.data);
        setImagePreviewUrl(
          userInfoResponse.data.profile_image_url
            ? `${BACKEND_URL}${userInfoResponse.data.profile_image_url}`
            : "/images/userinfo/profile_default.png"
        );
      } catch (error) {
        console.error("Error fetching plans or user info", error);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanClick = (plan) => {
    if (!currentPlan) {
      setSelectedPlan(plan);
      setShowModal(true);
    } else if (plan.id === currentPlan.id) {
      alert("현재 구독 중인 플랜입니다.");
    } else if (plan.id < currentPlan.id) {
      alert("현재 구독 중인 플랜이 더 좋은 플랜입니다.");
    } else {
      setSelectedPlan(plan);
      setShowModal(true);
    }
  };

  const confirmPlanChange = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BACKEND_URL}/api/payments/create/`, {
        plan_id: selectedPlan.id,
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      setShowModal(false);
      router.push("/payment");
    } catch (error) {
      console.error("Error changing plan", error);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.userInfo}>
          <div className={styles.userIcon}>
            <img src={imagePreviewUrl} alt="User Icon" />
          </div>
          <div>
            <h2>{user.username || "User Name"}</h2>
            <p>현재 구독플랜</p>
          </div>
          <p>다음 결제일 : {nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString() : "정보 없음"}</p>
        </div>
        {currentPlan ? (
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
        ) : (
          <p>현재 구독 중인 플랜이 없습니다.</p>
        )}
      </div>
      <div className={styles.contactUs}>
        <h2>Voice Verity와 함께해요.</h2>
        <p>당신의 든든한 파트너가 될 수 있습니다.</p>
        <button onClick={() => router.push("/contact")}>Contact Us</button>
      </div>
      <Footer />
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>구독 변경 확인</h2>
            <p>현재 구독 플랜: {currentPlan?.name || "없음"}</p>
            <p>새로운 구독 플랜: {selectedPlan.name}</p>
            <p>이 변경사항을 확인하면 새로운 구독으로 결제됩니다.</p>
            <button onClick={confirmPlanChange}>확인</button>
            <button onClick={() => setShowModal(false)}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlan;
