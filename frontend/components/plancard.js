import React, { useEffect, useState } from "react";
import styles from "../styles/Plan.module.css";
import axios from "axios";
import { useRouter } from "next/router";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PlanCard = ({ plan, userCredits }) => {
  const router = useRouter();

  const handlePayment = async (price, planId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/payments/create/`,
        { plan_id: planId },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
          withCredentials: true,  // 세션 인증을 위해 필요
        }
      );
      const { next_redirect_pc_url, tid } = response.data;
      sessionStorage.setItem("tid", tid); // 세션 스토리지에 TID 저장
      window.location.href = next_redirect_pc_url;
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const getRemainingCreditsMessage = () => {
    if (plan.is_recurring && userCredits) {
      const remainingCredits = userCredits.total_daily_credits;
      if (remainingCredits > 0) {
        let additionalMessage = "Credit이 부족한 구독을 업그레이드 하세요.";
        if (plan.name === "Professional") {
          additionalMessage = "Credit이 부족한 경우 Additional Credit을 구매하세요.";
        }
        return (
          <>
            <p>현재 {remainingCredits}개의 Daily Credit이 남아있습니다.</p>
            <p>{additionalMessage}</p>
          </>
        );
      }
    }
    return null;
  };

  return (
    <div className={styles.planCard}>
      <div style={{ height: "100px", marginTop: "50px" }}>
        <div className={styles.circle} />
      </div>
      <h2>{plan.name}</h2>
      {plan.options ? (
        <>
          {plan.options.map((option, index) => (
            <div key={index} className={styles.option}>
              <div
                className={styles.textbtn}
                onClick={() => handlePayment(option.price, option.id)}
              >
                <p>
                  {option.price.toLocaleString("ko-KR")} / {option.credits}{" "}
                  Credit 구매
                </p>
              </div>
            </div>
          ))}
          <div style={{ margin: "3px 10px" }}>
            <p>구매한 Credit은 90일 후 만료됩니다.</p>
          </div>
          <div style={{ width: "80%", marginTop: "20px" }}>
            <hr style={{ border: "solid 1px #A0A0A0", margin: "-2px" }} />
          </div>
          <ul
            style={{
              margin: "-1px",
              padding: "10px",
            }}
            className={styles.optli}
          >
            <li>{plan.description1}</li>
            <li>{plan.description2}</li>
          </ul>
        </>
      ) : (
        <>
          <div className={styles.daily}>
            <p>하루 API</p>
            <p>{plan.dailyCalls}회 호출</p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <p style={{ fontSize: "80px" }}>
              {plan.price.toLocaleString("ko-KR")}
            </p>
            <div className={styles.circle2}>$</div>
          </div>
          <button
            className={styles.button}
            onClick={() => handlePayment(plan.price, plan.id)}
          >
            Buy Now
          </button>
          {getRemainingCreditsMessage()}
          <ul>
            <li>{plan.description1}</li>
            <li>{plan.description2}</li>
          </ul>
        </>
      )}
    </div>
  );
};

export default PlanCard;
