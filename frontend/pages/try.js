import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import ReactAudioPlayer from "react-audio-player";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chart from "chart.js/auto"; // 차트 라이브러리 추가
import styles from "../styles/Try.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.mp4'];
const MAX_FILE_SIZE_MB = 20;

export default function TryVoice() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [predictions, setPredictions] = useState([]);
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to access this page");
      router.push("/login");
    }
  }, [router]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const fileSizeMB = selectedFile.size / (1024 * 1024);

    if (!ALLOWED_EXTENSIONS.includes(`.${fileExtension}`)) {
      alert("Invalid file type. Allowed extensions are: .wav, .mp3, .mp4");
      return;
    }

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert("File size exceeds the 20MB limit.");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name); // 파일 이름 설정
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }
    setLoading(true); // 로딩 시작
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
      setResult(analysisResult);
      setPredictions(response.data.predictions);
      setLoading(false); // 로딩 종료
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Error uploading file");
      setLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    if (predictions.length > 0) {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
      const ctx1 = document.getElementById("lineChart").getContext("2d");
      lineChartRef.current = new Chart(ctx1, {
        type: "line",
        data: {
          labels: predictions.map((_, index) => index + 1),
          datasets: [{
            label: "Real/Fake Probability",
            data: predictions,
            borderColor: "rgba(75, 192, 192, 1)",
            fill: false
          }]
        },
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: "Seconds"
              }
            },
            y: {
              title: {
                display: true,
                text: "Probability (Real)"
              },
              min: 0,
              max: 1
            }
          }
        }
      });

      if (pieChartRef.current) {
        pieChartRef.current.destroy();
      }
      const realCount = predictions.filter(p => p > 0.5).length;
      const fakeCount = predictions.length - realCount;
      const ctx2 = document.getElementById("pieChart").getContext("2d");
      pieChartRef.current = new Chart(ctx2, {
        type: "pie",
        data: {
          labels: ["Real", "Fake"],
          datasets: [{
            data: [realCount, fakeCount],
            backgroundColor: ["#9B90D2", "#CCCCCC"]
          }]
        }
      });
    }
  }, [predictions]);

  return (
    <div className={styles.previewContext}>
      <div className={styles.mainContent}>
        <Navbar />
        <div className={styles.block}>
          <div style={{ height: "100px" }} />
          <h1>Try Voice Verity</h1>
          <h2>
            Voice Verity에서는 실시간 통화 중 딥보이스를 감지할 수 있습니다.
          </h2>
          <h2>Fake Voice를 탐지하는 순간을 체험해보세요.</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              {fileName ? (
                <span className={styles.fileName} onClick={() => document.getElementById("upload").click()}>
                  {fileName}
                </span>
              ) : (
                <label htmlFor="upload" className={styles.uploadLabel}>
                  <span className={styles.uploadIcon}></span>
                </label>
              )}
              <input
                id="upload"
                type="file"
                onChange={handleFileChange}
                className={styles.uploadHidden}
              />
            </div>
            <h2>음성파일을 업로드한 뒤, Start Detection 버튼을 눌러주세요</h2>
            <p style={{ color: "#666" }}>10MB 이내의 음성 파일로 제한(파일: .wav, .mp3, .mp4)</p>
            <button type="submit">▶ Start Detection</button>
          </form>
          {loading && <p>분석중...</p>}
          {predictions.length > 0 && (
            <div className={styles.resultContext}>
              <h1>Detect Report</h1>
              <h2>Voice Verity는 이렇게 분석했어요.</h2>
              <div className={styles.chartContainer}>
                <canvas id="lineChart" className={styles.chart}></canvas>
                <canvas id="pieChart" className={styles.chart}></canvas>
              </div>
              <p>이 음성은 {result} 입니다.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
