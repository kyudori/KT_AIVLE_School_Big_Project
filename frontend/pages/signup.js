import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/Signup1.module.css";
import Image from "next/image";

export default function Signup() {
  const router = useRouter();
  const [allChecked, setAllChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState({
    personalInfo: false,
    serviceTerms: false,
    voiceCollection: false,
  });

  useEffect(() => {
    const savedTerms = JSON.parse(localStorage.getItem("termsChecked"));
    if (savedTerms) {
      setTermsChecked(savedTerms);
      setAllChecked(Object.values(savedTerms).every((value) => value));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("termsChecked", JSON.stringify(termsChecked));
  }, [termsChecked]);

  const handleAllCheck = () => {
    const newCheckState = !allChecked;
    setAllChecked(newCheckState);
    setTermsChecked({
      personalInfo: newCheckState,
      serviceTerms: newCheckState,
      voiceCollection: newCheckState,
    });
  };

  const handleCheck = (term) => {
    const newCheckState = !termsChecked[term];
    setTermsChecked({
      ...termsChecked,
      [term]: newCheckState,
    });
    setAllChecked(
      newCheckState &&
        Object.keys(termsChecked).every(
          (key) => key === term || termsChecked[key]
        )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!termsChecked.personalInfo || !termsChecked.serviceTerms) {
      alert("필수 약관에 동의해주세요.");
      return;
    }
    localStorage.setItem("allowedToSignup2", "true");
    router.push("/signup2");
  };

  return (
    <div className={styles.container}>
      <div style={{ padding: "0 200px", background: "#fff" }}>
        <Navbar />
      </div>
      <div style={{ height: "50px" }} />
      <div className={styles.main}>
        <div className={styles.logoContainer}>
          <Image
            src="/images/logo.png"
            alt="Voice Verity Logo"
            width={115}
            height={80}
          />
        </div>
        <div className={styles.signupBox}>
          <div className={styles.progress}>
            <span style={{ margin: "0 15px" }}>1 / 2</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFilled} />
            </div>
          </div>
          <h1>Voice Verity</h1>
          <h1>서비스 약관에 동의 해주세요.</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.checkboxContainer}>
              <label>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleAllCheck}
                />
                <span>모두 동의합니다.</span>
              </label>
              <div className={styles.allcheck}>
                <div style={{ width: "300px" }}>
                  <p>
                    전체 동의는 필수 및 선택정보에 대한 동의도 포함되어 있으며,
                    개별적으로도 동의를 선택하실 수 있습니다. 선택항목에 대한
                    동의를 거부하시는 경우에도 서비스는 이용이 가능합니다.
                  </p>
                </div>
              </div>
              <hr style={{ border: "solid 1px #d9d9d9" }} />
              <div className={styles.termsList}>
                <label>
                  <input
                    type="checkbox"
                    checked={termsChecked.personalInfo}
                    onChange={() => handleCheck("personalInfo")}
                  />
                  <a
                    href="/terms/personal-info"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [필수] 개인정보 수집 및 이용 동의
                  </a>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={termsChecked.serviceTerms}
                    onChange={() => handleCheck("serviceTerms")}
                  />
                  <a
                    href="/terms/service-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [필수] Voice Verity 통합서비스 약관
                  </a>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={termsChecked.voiceCollection}
                    onChange={() => handleCheck("voiceCollection")}
                  />
                  <a
                    href="/terms/voice-collection"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [선택] 음성 보이스 수집 및 이용 동의
                  </a>
                </label>
              </div>
            </div>
            <button type="submit" className={styles.signupButton}>
              동의
            </button>
          </form>
        </div>
      </div>
      <div style={{ height: "50px" }} />
      <Footer />
    </div>
  );
}
