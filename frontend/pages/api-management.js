// pages/api-management.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "../styles/Apimanagement.module.css";
import Footer from "../components/Footer";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const ApiManagement = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const router = useRouter();

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
          console.error("사용자 정보 가져오기 오류", error);
        });
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleLogoClick = () => {
    router.push("/home");
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <div className={styles.content}>
            <div className={styles.row}>
              <div className={styles.card}>
                <div className={styles.cardcontent}>
                  <h3>Daily Credit</h3>
                  <div className={styles.credit}>38%</div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardcontent}>
                  <h3>Additional Credit</h3>
                  <div className={styles.credit}>38%</div>
                </div>
              </div>
              <div className={styles.card}>
                <h3>API Status</h3>
                <p>내 API Key : sk-kdjlkjafij921uij</p>
                <p>
                  현재 API 상태 : 정상 <span className={styles.status}></span>
                </p>
                <p>마지막 사용 시간 : 2000/00/00 00:00:00</p>
              </div>
            </div>
            <div className={styles.trafficSummary}>
              <div className={styles.traffic}>
                <h3>Traffic</h3>
                <div className={styles.graph}>
                  시간별 / 일별 / 월별 / 년별 API 응답 요청 수 그래프
                </div>
              </div>
              <div className={styles.summary}>
                <h3>Summary</h3>
                <div className={styles.graph}>오류율 그래프</div>
              </div>
            </div>
          </div>
        );
      case "apiManagement":
        return (
          <div className={styles.content}>
            <div className={styles.apiCard}>
              <div className={styles.keydlete}>
                <h3>내 API Key</h3>
                <button className={styles.deleteButton}>키 삭제</button>
              </div>
              <div>
                <div className={styles.keySection}>
                  <h3>Key Value</h3>
                  <div>
                    <input
                      className={styles.keyValue}
                      value="sk-kdjlkjafij921uij"
                      disabled
                    />
                    <button className={styles.button}>재발급</button>
                  </div>
                </div>
                <div className={styles.statusSection}>
                  <h3>Activate Status</h3>
                  <div className={styles.use}>
                    <input type="radio" name="status" value="사용함" /> 사용함
                    <input
                      type="radio"
                      name="status"
                      value="사용 안함"
                      style={{ marginLeft: "20px" }}
                    />{" "}
                    사용 안함
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        <div className={styles.sidebar}>
          <div className={styles.logo} onClick={handleLogoClick}>
            <img src="/images/logo.png" alt="Voice Verity Logo" />
            <h2>Voice Verity</h2>
          </div>
          <ul className={styles.menu}>
            <li
              className={currentPage === "dashboard" ? styles.activeli : ""}
              onClick={() => setCurrentPage("dashboard")}
            >
              Dashboard
              <div
                className={currentPage === "dashboard" ? styles.active : ""}
              />
            </li>
            <li
              className={currentPage === "apiManagement" ? styles.activeli : ""}
              onClick={() => setCurrentPage("apiManagement")}
            >
              API 관리
              <div
                className={currentPage === "apiManagement" ? styles.active : ""}
              />
            </li>
            <li>보안 및 인증</li>
            <li>알림 설정</li>
          </ul>
        </div>
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>{currentPage === "dashboard" ? "DashBoard" : "API 관리"}</h1>
              <span>Welcome! {user ? user.username : "[User name]"}!</span>
            </div>
            <div className={styles.user} onClick={toggleDropdown}>
              <img
                src={
                  user
                    ? `${BACKEND_URL}${user.profile_image_url}`
                    : "/images/userinfo/profile_default.png"
                }
                alt="Profile"
                className={styles.profileImage}
              />
              <div>
                <span className={styles.userName}>
                  {user ? user.username : "User Name"}
                </span>
                <span className={styles.userEmail}>
                  {user ? user.email : "User ID"}
                </span>
              </div>
              <div className={styles.dropdownIcon}>▼</div>
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <ul>
                    <li onClick={() => setCurrentPage("user-info")}>내정보</li>
                    <li onClick={() => setCurrentPage("plan")}>내구독</li>
                    <li onClick={handleLogout}>로그아웃</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApiManagement;
