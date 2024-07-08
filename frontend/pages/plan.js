import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PlanCard from "../components/plancard";
import axios from "axios";
import styles from "../styles/Plan.module.css";
import { useRouter } from "next/router";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const plans = [
  {
    id: 1,
    name: "Pay As You Go",
    options: [
      { price: "9.99$", credits: 10 },
      { price: "45.99$", credits: 65 },
    ],
    description1: "구독이 필요하지 않습니다. 사용할 만큼만 비용을 지불하세요.",
    description2: "오래 사용할 수 있습니다. 90일 동안 자유롭게 사용하세요.",
  },
  {
    id: 2,
    name: "Basic",
    price: 9,
    dailyCalls: 10,
    description1: "0.9$ / 1회",
    description2: "30일 구독 상품",
  },
  {
    id: 3,
    name: "Associate",
    price: 29,
    dailyCalls: 50,
    description1: "0.58$ / 1회",
    description2: "30일 구독 상품",
  },
  {
    id: 4,
    name: "Professional",
    price: 79,
    dailyCalls: 200,
    description1: "0.39$ / 1회",
    description2: "30일 구독 상품",
  },
];

const Plans = () => {
  const [user, setUser] = useState(null);

  const handleContactUs = () => {
    router.push("/contact");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${BACKEND_URL}/api/user-info/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user info", error);
        });
    }
  }, []);

  const handlePayment = async (price, planId) => {
    try {
      const token = localStorage.getItem("token");
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
      console.error("결제 요청 실패:", error);
      alert("결제 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ padding: "0 200px", background: "#fff" }}>
        <Navbar />
      </div>
      <div style={{height:'150px'}} />
      <div className={styles.main}>
        <div style={{height:'200px'}}>
          <h1>Voice Verity</h1>
          <p>
            Voice Verity에서는 실시간 통화 중 딥보이스를 감지할 수 있습니다.
          </p>
          <p>내게 맞는 Voice Verity 요금제를 선택하세요.</p>
        </div>
        <div className={styles.plansContainer}>
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} handlePayment={handlePayment} />
          ))}
        </div>
      </div>
      <div style={{height:'200px'}} />
      <div className={styles.contactUs}>
        <h2>Voice Verity와 함께해요.</h2>
        <p style={{ margin: "20px" }}>당신의 든든한 파트너가 될 수 있습니다.</p>
        <button onClick={handleContactUs}>Contact Us</button>
      </div>
      <Footer />
    </div>
  );
};

export default Plans;
