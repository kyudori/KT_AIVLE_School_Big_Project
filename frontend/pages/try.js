import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import ReactAudioPlayer from "react-audio-player";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/Try.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function TryVoice() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState("celebrity"); // 'celebrity' or 'phishing'
  const [playingCelebrity, setPlayingCelebrity] = useState(null);
  const [playingFake, setPlayingFake] = useState(null);
  const [isPlayingCelebrity, setIsPlayingCelebrity] = useState(false);
  const [isPlayingFake, setIsPlayingFake] = useState(false);
  const router = useRouter();

  const celebAudioRef = useRef(null);
  const fakeAudioRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to access this page");
      router.push("/login");
    }
  }, [router]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BACKEND_URL}/api/upload-audio/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        }
      );
      const analysisResult = response.data.analysis_result;
      const message =
        analysisResult === 1 ? "음성 파일입니다." : "음성 파일이 아닙니다.";
      setResult(message);
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Error uploading file");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    stopAllAudio(); // Stop all audio when tab changes
  };

  const playCelebrityAudio = (audio) => {
    if (playingCelebrity === audio && isPlayingCelebrity) {
      // If the same audio is clicked, pause it
      celebAudioRef.current.audioEl.current.pause();
      setIsPlayingCelebrity(false);
    } else {
      // Stop fake audio if playing
      if (isPlayingFake) {
        fakeAudioRef.current.audioEl.current.pause();
        setIsPlayingFake(false);
      }

      // Play the selected celebrity audio
      setPlayingCelebrity(audio);
      setIsPlayingCelebrity(true);
      setTimeout(() => {
        celebAudioRef.current.audioEl.current.play();
      }, 100);
    }
  };

  const playFakeAudio = (audio) => {
    if (playingFake === audio && isPlayingFake) {
      // If the same audio is clicked, pause it
      fakeAudioRef.current.audioEl.current.pause();
      setIsPlayingFake(false);
    } else {
      // Stop celebrity audio if playing
      if (isPlayingCelebrity) {
        celebAudioRef.current.audioEl.current.pause();
        setIsPlayingCelebrity(false);
      }

      // Play the selected fake audio
      setPlayingFake(audio);
      setIsPlayingFake(true);
      setTimeout(() => {
        fakeAudioRef.current.audioEl.current.play();
      }, 100);
    }
  };

  const stopAllAudio = () => {
    if (isPlayingCelebrity) {
      celebAudioRef.current.audioEl.current.pause();
      setIsPlayingCelebrity(false);
    }
    if (isPlayingFake) {
      fakeAudioRef.current.audioEl.current.pause();
      setIsPlayingFake(false);
    }
  };

  return (
    <div className={styles.previewContext}>
      <div className={styles.mainContent}>
        <Navbar />
        <div className={styles.block}>
          <div style={{height:"100px"}} />
          <h1>Try Voice Verity</h1>
          <h2>
            Voice Verity에서는 실시간 통화 중 딥보이스를 감지할 수 있습니다.
          </h2>
          <h2>Fake Voice를 탐지하는 순간을 체험해보세요.</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
            <label for="upload"></label>
            <input id='upload' type="file" onChange={handleFileChange}
            className={styles.uploadhidden}></input>
            </div>
            <h2>음성파일을 넣은 뒤, Generate 버튼을 눌러주세요</h2>
            <p style={{color:"#666"}}>10MB 이내의 음성 파일로 제한(파일: .wav, .mp3, .mp4)</p>
            <button type="submit">▶ Start Detection</button>
          </form>
          <div className={styles.resultContext}>
            {result && (
              <div>
                <h2>Analysis Result:</h2>
                <p>{result}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
