import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../styles/Myplan.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const MyPlan = () => {
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

        const currentPlanResponse = await axios.get(
          `${BACKEND_URL}/api/current-plan/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        if (currentPlanResponse.data.plan) {
          setCurrentPlan(currentPlanResponse.data.plan);
          setNextPaymentDate(currentPlanResponse.data.next_payment_date);
        }

        const userInfoResponse = await axios.get(
          `${BACKEND_URL}/api/user-info/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
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

  const handlePlanClick = (planId) => {
    if (!currentPlan) {
      setSelectedPlan(planId);
      setShowModal(true);
    } else if (planId === currentPlan.id) {
      alert("현재 구독 중인 플랜입니다.");
    } else if (planId < currentPlan.id) {
      alert("현재 구독 중인 플랜이 더 좋은 플랜입니다.");
    } else {
      setSelectedPlan(planId);
      setShowModal(true);
    }
  };

  const confirmPlanChange = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/create/`,
        {
          plan_id: selectedPlan,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      const { next_redirect_pc_url, tid } = response.data;
      sessionStorage.setItem("tid", tid); // 세션 스토리지에 TID 저장
      window.location.href = next_redirect_pc_url;
    } catch (error) {
      console.error("Error changing plan", error);
    }
  };

  const plans = [
    {
      id: 3,
      name: "Basic",
      price: 9900,
      description1: "0.9$ / 1회",
      description2: "30일 구독 상품",
    },
    {
      id: 4,
      name: "Associate",
      price: 29900,
      description1: "0.58$ / 1회",
      description2: "30일 구독 상품",
    },
    {
      id: 5,
      name: "Professional",
      price: 79900,
      description1: "0.39$ / 1회",
      description2: "30일 구독 상품",
    },
  ];

  return (
    <div className={styles.container}>
      <div style={{ padding: "0 200px", background: "#fff" }}>
        <Navbar />
      </div>
      <div style={{ height: "50px" }} />
      <div className={styles.main}>
        <div className={styles.userInfo}>
          <div className={styles.userIcon}>
            <img src={imagePreviewUrl} alt="User Icon" />
          </div>
          <h2>{user.username || "User Name"}</h2>
        </div>
        <div className={styles.text}>
          <h1>현재 구독플랜</h1>
          <p className={styles.paymentDate}>
            다음 결제일 :{" "}
            {nextPaymentDate
              ? new Date(nextPaymentDate).toLocaleDateString()
              : "정보 없음"}
          </p>
        </div>
        <div className={styles.plans}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.planCard} ${
                plan.id === currentPlan?.id ? styles.currentPlan : ""
              }`}
              onClick={() => handlePlanClick(plan.id)}
            >
              <div className={styles.planHeader}>
                {plan.id === currentPlan?.id && (
                  <div className={styles.checkIcon}>✓</div>
                )}
                {plan.id !== plans[0].id && (
                  <div className={styles.arrowIcon}>▶</div>
                )}
              </div>
              <h2>{plan.name}</h2>
              <ul>
                <li>{plan.description1}</li>
                <li>{plan.description2}</li>
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
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>구독 변경 확인</h2>
            <p>현재 구독 플랜: {currentPlan?.name || "없음"}</p>
            <p>새로운 구독 플랜: {plans.find(p => p.id === selectedPlan).name}</p>
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
