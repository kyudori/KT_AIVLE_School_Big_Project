import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, BarElement, LinearScale, CategoryScale } from 'chart.js';
import { Doughnut, Bar } from "react-chartjs-2";
import styles from "../styles/Apimanagement.module.css";
import Footer from "../components/Footer";

ChartJS.register(ArcElement, Tooltip, Legend, Title, BarElement, LinearScale, CategoryScale);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const ApiManagement = () => {
  const [user, setUser] = useState(null);
  const [dailyCredits, setDailyCredits] = useState(0);
  const [additionalCredits, setAdditionalCredits] = useState(0);
  const [freeCredits, setFreeCredits] = useState(0);
  const [usedCredits, setUsedCredits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [apiKey, setApiKey] = useState(null);
  const [apiLastUsed, setApiLastUsed] = useState(null);
  const [apiStatus, setApiStatus] = useState(false); // Activate status
  const [isApiServerOn, setIsApiServerOn] = useState(false); // API Server status
  const [isOpen, setMenu] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState('hourly');
  const [trafficData, setTrafficData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${BACKEND_URL}/api/user-info/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
          withCredentials: true, // 세션 인증을 위해 필요
        })
        .then((response) => {
          setUser(response.data);
          fetchApiKey(token);
          fetchCredits(token);
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

  useEffect(() => {
    if (user) {
      fetchTrafficData();
    }
  }, [user]);

  const fetchApiKey = (token) => {
    axios
      .get(`${BACKEND_URL}/api/get-api-key/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
        withCredentials: true, // 세션 인증을 위해 필요
      })
      .then((response) => {
        setApiKey(response.data.api_key);
        setApiLastUsed(response.data.last_used_at);
        setApiStatus(response.data.is_active);
      })
      .catch((error) => {
        console.error("API Key 가져오기 오류", error);
      });
  };

  const fetchCredits = (token) => {
    axios
      .get(`${BACKEND_URL}/api/get-credits/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
        withCredentials: true,
      })
      .then((response) => {
        setDailyCredits(response.data.remaining_daily_credits);
        setAdditionalCredits(response.data.remaining_additional_credits);
        setFreeCredits(response.data.remaining_free_credits);
        setUsedCredits(
          response.data.total_credits -
            (response.data.remaining_daily_credits +
              response.data.remaining_additional_credits +
              response.data.remaining_free_credits)
        );
        setTotalCredits(response.data.total_credits);
      })
      .catch((error) => {
        console.error("크레딧 가져오기 오류", error);
      });
  };

  const checkApiServerStatus = (token) => {
    axios
      .get(`${BACKEND_URL}/api/check-api-status/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
        withCredentials: true, // 세션 인증을 위해 필요
      })
      .then((response) => {
        setIsApiServerOn(response.data.status === "OK");
      })
      .catch((error) => {
        setIsApiServerOn(false);
        console.error("API 서버 상태 확인 오류", error);
      });
  };

  const fetchTrafficData = () => {
    axios
      .get(`${BACKEND_URL}/api/call-history/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      })
      .then((response) => {
        setTrafficData(response.data);
      })
      .catch((error) => {
        console.error("트래픽 데이터 가져오기 오류", error);
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
            withCredentials: true, // 세션 인증을 위해 필요
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
            withCredentials: true, // 세션 인증을 위해 필요
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
            withCredentials: true, // 세션 인증을 위해 필요
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
            withCredentials: true, // 세션 인증을 위해 필요
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
    setMenu((isOpen) => !isOpen);
  };

  const handleIntervalChange = (interval) => {
    setSelectedInterval(interval);
  };

  const filterTrafficData = (interval) => {
    const now = new Date();
    let filteredData = [];

    switch (interval) {
      case 'hourly':
        filteredData = trafficData.filter(item => new Date(item.timestamp) > new Date(now.getTime() - (24 * 60 * 60 * 1000)));
        break;
      case 'daily':
        filteredData = trafficData.filter(item => new Date(item.timestamp) > new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)));
        break;
      case 'weekly':
        filteredData = trafficData.filter(item => new Date(item.timestamp) > new Date(now.getTime() - (12 * 7 * 24 * 60 * 60 * 1000)));
        break;
      case 'monthly':
        filteredData = trafficData.filter(item => new Date(item.timestamp) > new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)));
        break;
      default:
        filteredData = trafficData;
    }

    return filteredData;
  };

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        const data = {
          labels: ["Free", "Daily", "Additional", "Used"],
          datasets: [
            {
              data: [
                freeCredits,
                dailyCredits,
                additionalCredits,
                usedCredits,
              ],
              backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384", "#CCCCCC"],
            },
          ],
        };

        const options = {
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const label = data.labels[tooltipItem.dataIndex];
                  const value =
                    data.datasets[tooltipItem.datasetIndex].data[
                      tooltipItem.dataIndex
                    ];
                  return `${label}: ${value}개`;
                },
              },
            },
            title: {
              display: true,
              text: `${Math.round(((totalCredits - usedCredits) / totalCredits) * 100)}% 남음`,
              position: 'top',
              align: 'center',
              font: {
                size: 18,
              },
            },
          },
          cutout: '70%',
          responsive: true,
          maintainAspectRatio: false,
        };

        const filteredTrafficData = filterTrafficData(selectedInterval);
        const trafficLabels = filteredTrafficData.length > 0 ? filteredTrafficData.map((item) => new Date(item.timestamp).toLocaleString()) : ["API 사용 기록이 없습니다."];
        const trafficCounts = filteredTrafficData.length > 0 ? filteredTrafficData.map((item) => item.count) : [0];

        const trafficDataChart = {
          labels: trafficLabels,
          datasets: [
            {
              label: 'API Calls',
              data: trafficCounts,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        };

        const trafficOptions = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        };

        return (
          <div className={styles.content}>
            <div className={styles.row}>
              <div className={styles.card}>
                <div className={styles.cardcontent}>
                  <h3>남은 Credit</h3>
                  <div className={styles.credit}>
                    {totalCredits}개
                    <p>Free Credit: {freeCredits}개</p>
                    {dailyCredits > 0 && <p>Daily Credit: {dailyCredits}개</p>}
                    {additionalCredits > 0 && <p>Additional Credit: {additionalCredits}개</p>}
                  </div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardcontent}>
                  <h3>사용 현황</h3>
                  <div className={styles.doughnutWrapper}>
                    <Doughnut data={data} options={options} />
                  </div>
                  <button
                    className={styles.purchaseButton}
                    onClick={() => router.push("/plan")}
                  >
                    추가 Credit 구매하기
                  </button>
                </div>
              </div>
              <div className={styles.card}>
                <h3>API Status</h3>
                <p>내 API Key : {apiKey || "현재 키 없음"}</p>
                <p>
                  현재 API 상태 :{" "}
                  {isApiServerOn ? (
                    <span style={{ color: "green" }}>ON</span>
                  ) : (
                    <span style={{ color: "red" }}>OFF</span>
                  )}{" "}
                  <span
                    className={styles.status}
                    style={{
                      backgroundColor: isApiServerOn ? "green" : "red",
                    }}
                  ></span>
                </p>
                <p>마지막 사용 시간 : {apiLastUsed ? apiLastUsed : "사용한 기록이 없습니다."}</p>
              </div>
            </div>
            <div className={styles.trafficSummary}>
              <div className={styles.traffic}>
                <h3>Traffic</h3>
                <div className={styles.intervalTabs}>
                  <button onClick={() => handleIntervalChange('hourly')}>시간별</button>
                  <button onClick={() => handleIntervalChange('daily')}>일별</button>
                  <button onClick={() => handleIntervalChange('weekly')}>주별</button>
                  <button onClick={() => handleIntervalChange('monthly')}>월별</button>
                </div>
                <div className={styles.graph}>
                  <Bar data={trafficDataChart} options={trafficOptions} />
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

