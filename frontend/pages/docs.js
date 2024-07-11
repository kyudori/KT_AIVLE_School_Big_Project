import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/Docs.module.css";

export default function Documentation() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(`.${styles.section}`);
      let currentSection = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 50) {
          currentSection = section.getAttribute("id");
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigateToSetting = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    router.push("/management");
  };

  const handleContactUs = () => {
    router.push("/contact");
  };

  const handleCopyClick = (textToCopy) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          alert("복사되었습니다.");
        })
        .catch((error) => {
          console.error("복사 실패:", error);
        });
    } else {
      // HTTPS가 아닌 환경에서는 execCommand를 사용
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";  // avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        alert("복사되었습니다.");
      } catch (err) {
        console.error("복사 실패:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={styles.documentationContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.sidebar}>
          <ul className={styles.sidebarList}>
            <li
              className={activeSection === "start" ? styles.active : ""}
              onClick={() => handleScrollToSection("start")}
            >
              시작 하기
            </li>
            <li
              className={
                activeSection === "supported-files" ? styles.active : ""
              }
              onClick={() => handleScrollToSection("supported-files")}
            >
              지원 파일
            </li>
            <li
              className={
                activeSection === "authentication" ? styles.active : ""
              }
              onClick={() => handleScrollToSection("authentication")}
            >
              인증
            </li>
            <li
              className={activeSection === "endpoints" ? styles.active : ""}
              onClick={() => handleScrollToSection("endpoints")}
            >
              엔드 포인트
            </li>
            <li
              className={activeSection === "error-codes" ? styles.active : ""}
              onClick={() => handleScrollToSection("error-codes")}
            >
              에러 코드
            </li>
          </ul>
        </div>
        <div className={styles.center}>
          <div className={styles.content}>
            <Navbar />
            <section id="start" className={styles.section}>
              <div className={styles.headsection}>
                <h1 className={styles.heading}>Voice Verity documentation</h1>
                <p>
                  <span>
                    Voice Verity는 KT AivleSchool 5기 AI Track 8조가 제공하는
                  </span>
                  <br />
                  <span>API 및 플랫폼 서비스 입니다.</span>
                </p>
                <div className={styles.cardContainer}>
                  <div
                    className={styles.card}
                    onClick={() => handleScrollToSection("start")}
                  >
                    <div className={styles.cardicon}></div>
                    <div className={styles.cardtext}>
                      <h2>시작 하기</h2>
                      <p style={{ color: "#444", fontSize: "20px" }}>Get start</p>
                      <p style={{ color: "blue" }}>Read documentation &gt;</p>
                    </div>
                  </div>
                  <div
                    className={styles.card}
                    onClick={handleNavigateToSetting}
                  >
                    <div className={styles.cardicon2}></div>
                    <div className={styles.cardtext}>
                      <h2>Key 발급</h2>
                      <p style={{ color: "#444", fontSize: "20px" }}>Get Key</p>
                      <p style={{ color: "blue" }}>Go to API Management &gt;</p>
                    </div>
                  </div>
                </div>
                <h3>
                  Voice Verity는 음성 파일에 대해 Deep Fake 여부를 판별합니다.
                </h3>
              </div>
            </section>
            <section id="supported-files" className={styles.section}>
              <div className={styles.filesection}>
                <h2>지원하는 파일 형식</h2>
                <h3>File format</h3>
                <div className={styles.fileFormats}>
                  <span className={styles.fileFormat}>.wav</span>
                  <span className={styles.fileFormat}>.mp3</span>
                  <span className={styles.fileFormat}>.m4a</span>
                </div>
                <p>10MB 이하의 음성 파일</p>
              </div>
            </section>
            <section id="authentication" className={styles.section}>
              <h2>인증</h2>
              <p>플랫폼에 회원가입 및 로그인하여 API 키를 발급받습니다.</p>
              <hr />
              <div className={styles.codeEX}>
                <div className={styles.codetop}>
                  <p>JSON</p>
                  <span
                    onClick={() =>
                      handleCopyClick(`Authorization: Bearer YOUR_API_KEY`)
                    }
                  >
                    📋
                  </span>
                </div>
                <pre>Authorization: Bearer YOUR_API_KEY</pre>
              </div>
            </section>
            <section id="endpoints" className={styles.section}>
              <h2>엔드 포인트</h2>
              <hr />
              <div style={{ marginBottom: "50px" }}>
                <h3>1. 판별(Decision)</h3>
                <ul>
                  <li>URL: /api/decision</li>
                  <li>Method: POST</li>
                  <li>
                    설명: 업로드한 음성 파일을 기반으로 AI 모델로부터 Deep Fake 여부를 판단합니다.
                  </li>
                </ul>
                <h3>Example</h3>
                <h3 style={{ color: "#5B5B5B" }}>Request 요청 본문(json)</h3>
                <div className={styles.codeEX}>
                  <div className={styles.codetop}>
                    <p>JSON</p>
                    <span
                      onClick={() =>
                        handleCopyClick(`{
  "data": [
    {
      "feature1": value1,
      "feature2": value2,
      "feature3": value3
    }
  ]
}`)
                      }
                    >
                      📋
                    </span>
                  </div>
                  <pre>
                    {`
{
  "data": [
    {
      "feature1": value1,
      "feature2": value2,
      "feature3": value3
    }
  ]
}
              `}
                  </pre>
                </div>
                <br />
                <h3 style={{ color: "#5B5B5B" }}>Response 응답(json)</h3>
                <div className={styles.codeEX}>
                  <div className={styles.codetop}>
                    <p>JSON</p>
                    <span
                      onClick={() =>
                        handleCopyClick(`{
  "prediction": [예측값1, 예측값2, ...]
}`)
                      }
                    >
                      📋
                    </span>
                  </div>
                  <pre>
                    {`{
  "prediction": [예측값1, 예측값2, ...]
}`}
                  </pre>
                </div>
              </div>
              <div style={{ height: "20px" }} />
              <h3>2. 상태(Status)</h3>
              <ul>
                <li>URL: /api/status</li>
                <li>Method: GET</li>
                <li>설명: 호출하는 API 모델의 상태를 확인합니다.</li>
              </ul>
              <h3>Example</h3>
              <h3 style={{ color: "#5B5B5B" }}>Response 응답(json)</h3>
              <div className={styles.codeEX}>
                <div className={styles.codetop}>
                  <p>JSON</p>
                  <span
                    onClick={() =>
                      handleCopyClick(`{
  "status": "ready",
  "version": "1.0.0"
}`)
                    }
                  >
                    📋
                  </span>
                </div>
                <pre>
                  {`{
  "status": "ready",
  "version": "1.0.0"
}`}
                </pre>
              </div>
            </section>
            <section id="error-codes" className={styles.section}>
              <h2>에러 코드</h2>
              <p>
                API사용 시 발생할 수 있는 일반적인 에러 코드와 의미는 다음과
                같습니다.
              </p>
              <hr />
              <table>
                <tbody>
                  <tr>
                    <td className={styles.td1}>400 Bad Request</td>
                    <td>| 잘못된 요청 형식입니다.</td>
                  </tr>
                  <tr>
                    <td className={styles.td1}>401 Unauthorized</td>
                    <td>| 인증 실패입니다. 올바른 API 키를 제공하십시오.</td>
                  </tr>
                  <tr>
                    <td className={styles.td1}>403 Forbidden</td>
                    <td>| 접근 권한이 없습니다.</td>
                  </tr>
                  <tr>
                    <td className={styles.td1}>404 Not Found</td>
                    <td>| 요청한 리소스를 찾을 수 없습니다.</td>
                  </tr>
                  <tr>
                    <td className={styles.td1}>500 Internal Server Error</td>
                    <td>| 서버에 문제가 발생했습니다.</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ width: "840px" }}></div>
            </section>
            <section className={styles.section}>
              <div className={styles.contactUs}>
                <h2 style={{ textAlign: "center" }}>
                  Voice Verity와 함께해요.
                </h2>
                <p style={{ margin: "20px" }}>
                  당신의 든든한 파트너가 될 수 있습니다.
                </p>
                <button onClick={handleContactUs}>Contact Us</button>
              </div>
            </section>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
