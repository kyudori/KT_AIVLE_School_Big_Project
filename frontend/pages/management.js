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
  const [apiKey, setApiKey] = useState(null);
  const [apiStatus, setApiStatus] = useState(false); // Activate status
  const [isApiServerOn, setIsApiServerOn] = useState(false); // API Server status
  const [isOpen, setMenu] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${BACKEND_URL}/api/user-info/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
          withCredentials: true,  // 세션 인증을 위해 필요
        })
        .then((response) => {
          setUser(response.data);
          fetchApiKey(token);
          checkApiServerStatus(token); // Check API server status
        })
        .catch((error) => {
          console.error("사용자 정보 가져오기 오류", error);
          alert("로그인 후 이용 가능합니다.");
          router.push("/home");
        });
    } else {
      alert("로그인 후 이용 가능합니다.");
      router.push("/home");
    }
  }, [router]);

  const fetchApiKey = (token) => {
    axios
      .get(`${BACKEND_URL}/api/get-api-key/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
        withCredentials: true,  // 세션 인증을 위해 필요
      })
      .then((response) => {
        setApiKey(response.data.api_key);
        setApiStatus(response.data.is_active); // API key status
      })
      .catch((error) => {
        console.error("API Key 가져오기 오류", error);
      });
  };

  const checkApiServerStatus = (token) => {
    axios
      .get(`${BACKEND_URL}/api/check-api-status/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
        withCredentials: true,  // 세션 인증을 위해 필요
      })
      .then((response) => {
        setIsApiServerOn(response.data.status === "OK");
      })
      .catch((error) => {
        setIsApiServerOn(false);
        console.error("API 서버 상태 확인 오류", error);
      });
  };

  const handleGenerateApiKey = () => {
    const password = prompt("비밀번호를 입력해주세요:");
    if (password) {
      axios
        .post(
          `${BACKEND_URL}/api/get-api-key/`,
          { password },
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
            withCredentials: true,  // 세션 인증을 위해 필요
          }
        )
        .then((response) => {
          setApiKey(response.data.api_key);
          setApiStatus(true); // 활성화 상태
        })
        .catch((error) => {
          if (error.response && error.response.data.error) {
            alert(error.response.data.error);
          } else {
            console.error("API Key 생성 오류", error);
          }
        });
    }
  };

  const handleRegenerateApiKey = () => {
    const password = prompt("비밀번호를 입력해주세요:");
    if (password) {
      axios
        .post(
          `${BACKEND_URL}/api/regenerate-api-key/`,
          { password },
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
            withCredentials: true,  // 세션 인증을 위해 필요
          }
        )
        .then((response) => {
          setApiKey(response.data.api_key);
        })
        .catch((error) => {
          if (error.response && error.response.data.error) {
            alert(error.response.data.error);
          } else {
            console.error("API Key 재생성 오류", error);
          }
        });
    }
  };

  const handleDeleteApiKey = () => {
    const password = prompt("비밀번호를 입력해주세요:");
    if (password) {
      axios
        .post(
          `${BACKEND_URL}/api/delete-api-key/`,
          { password },
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
            withCredentials: true,  // 세션 인증을 위해 필요
          }
        )
        .then(() => {
          setApiKey(null);
          setApiStatus(false); // 비활성화 상태
        })
        .catch((error) => {
          if (error.response && error.response.data.error) {
            alert(error.response.data.error);
          } else {
            console.error("API Key 삭제 오류", error);
          }
        });
    }
  };

  const handleToggleApiStatus = (status) => {
    const password = prompt("비밀번호를 입력해주세요:");
    if (password) {
      axios
        .post(
          `${BACKEND_URL}/api/toggle-api-status/`,
          { password, status },
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
            withCredentials: true,  // 세션 인증을 위해 필요
          }
        )
        .then((response) => {
          setApiStatus(response.data.status);
        })
        .catch((error) => {
          if (error.response && error.response.data.error) {
            alert(error.response.data.error);
          } else {
            console.error("API Key 상태 변경 오류", error);
          }
        });
    }
  };

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

  const toggleMenu = () => {
    setMenu(isOpen => !isOpen);
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
                <p>내 API Key : {apiKey || "현재 키 없음"}</p>
                <p>
                  현재 API 상태 : {apiStatus ? "On" : "Off"}{" "}
                  <span
                    className={styles.status}
                    style={{
                      backgroundColor: isApiServerOn ? "green" : "red",
                    }}
                  ></span>
                  {isApiServerOn ? "Server On" : "Server Off"}
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
                <button
                  className={styles.deleteButton}
                  onClick={handleDeleteApiKey}
                >
                  키 삭제
                </button>
              </div>
              <div>
                <div className={styles.keySection}>
                  <h3>Key Value</h3>
                  <div>
                    <input
                      className={styles.keyValue}
                      value={apiKey || "현재 키 없음"}
                      disabled
                    />
                    <button
                      className={styles.button}
                      onClick={
                        apiKey ? handleRegenerateApiKey : handleGenerateApiKey
                      }
                    >
                      {apiKey ? "재발급" : "키 발급"}
                    </button>
                  </div>
                </div>
                <div className={styles.statusSection}>
                  <h3>Activate Status</h3>
                  <div className={styles.use}>
                    <input
                      type="radio"
                      name="status"
                      value="사용함"
                      checked={apiStatus}
                      onChange={() => handleToggleApiStatus(true)}
                    />{" "}
                    사용함
                    <input
                      type="radio"
                      name="status"
                      value="사용 안함"
                      style={{ marginLeft: "20px" }}
                      checked={!apiStatus}
                      onChange={() => handleToggleApiStatus(false)}
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
        <p className={isOpen ? styles.open : styles.hide} onClick={toggleMenu}>
          ◁
        </p>
        <div className={isOpen ? styles.sidebar : styles.sidebaroff}>
          <div className={styles.logo}>
            <img
              src="/images/logo.png"
              alt="Voice Verity Logo"
              onClick={handleLogoClick}
            />
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
                  user && user.profile_image_url
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
                    <li onClick={() => router.push("/user-info")}>내 정보</li>
                    <li onClick={() => router.push("/myplan")}>내 구독</li>
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
