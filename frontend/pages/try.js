import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chart from "chart.js/auto"; // 차트 라이브러리 추가
import annotationPlugin from "chartjs-plugin-annotation";
import styles from "../styles/Try.module.css";

// 플러그인 등록
Chart.register(annotationPlugin);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const ALLOWED_EXTENSIONS = [".wav", ".m4a", ".mp3"];
const MAX_FILE_SIZE_MB = 200;

export default function TryVoice() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [url, setUrl] = useState("");
  const [inputType, setInputType] = useState("file"); // 추가된 state
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [predictions, setPredictions] = useState([]);
  const [fakeCount, setFakeCount] = useState(0);
  const [realCount, setRealCount] = useState(0);
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // No need to check for token here
  }, [router]);

  const handleSubscriptionPlan = () => {
    router.push("/plan");
  };

  const handleUploadClick = (e) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후, 이용 가능합니다.");
      e.preventDefault();
      return;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    const fileSizeMB = selectedFile.size / (1024 * 1024);

    if (!ALLOWED_EXTENSIONS.includes(`.${fileExtension}`)) {
      alert("Invalid file type. Allowed extensions are: .wav, .mp3, .m4a");
      return;
    }

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert("File size exceeds the 10MB limit.");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name); // 파일 이름 설정
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후, 이용 가능합니다.");
      return;
    }

    if (inputType === "file") {
      if (!file) {
        alert("음성 파일을 업로드가 필요합니다.");
        return;
      }

      const previousFileName = localStorage.getItem("previousFileName");

      if (previousFileName === fileName) {
        const confirmRetry = confirm(
          "체험하기 서비스는 하루 5회만 이용 가능한 서비스입니다.\n동일한 파일로 분석을 다시 요청하시겠습니까?"
        );
        if (!confirmRetry) {
          return;
        }
      }

      localStorage.setItem("previousFileName", fileName);

      setLoading(true); // 로딩 시작
      const formData = new FormData();
      formData.append("file", file);
      try {
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
        const predictions = response.data.predictions;
        const fakeCount = response.data.fake_cnt;
        const realCount = response.data.real_cnt;

        setResult(analysisResult);
        setPredictions(predictions);
        setFakeCount(fakeCount);
        setRealCount(realCount);
        setLoading(false); // 로딩 종료
      } catch (error) {
        console.error("Error uploading file", error);
        if (error.response && error.response.status === 403 && error.response.data.error === 'You have reached the maximum number of uploads for today') {
          alert("오늘 체험하기 횟수 초과");
        } else {
          alert("Error uploading file");
        }
        setLoading(false); // 로딩 종료
      }
    } else {
      if (!url) {
        alert("YouTube URL을 입력해주세요.");
        return;
      }

      setLoading(true);

      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/upload-youtube/`,
          { url },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        const { analysis_result, predictions, fake_cnt, real_cnt } = response.data;

        setResult(analysis_result);
        setPredictions(predictions);
        setFakeCount(fake_cnt);
        setRealCount(real_cnt);
        setLoading(false);
      } catch (error) {
        console.error("Error uploading YouTube URL", error);
        alert("Error uploading YouTube URL");
        setLoading(false);
      }
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
          datasets: [
            {
              label: "Real/Fake Probability",
              data: predictions,
              fill: false,
              pointRadius: 0,
              borderColor: "rgb(155, 144, 210)",
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
            annotation: {
              annotations: {
                line1: {
                  type: "line",
                  yMin: 0.8,
                  yMax: 0.8,
                  borderColor: "red",
                  borderWidth: 2,
                  borderDash: [10, 5],
                  label: {
                    content: "0.8 (Fake)",
                    enabled: true,
                    position: "end",
                    backgroundColor: "rgba(255, 99, 132, 0.25)",
                  },
                },
              },
            },
          },
          responsive: false,
          scales: {
            x: {
              title: {
                display: false,
                text: "Seconds",
              },
              grid: {
                display: false,
              },
            },
            y: {
              grace: "100%",
              title: {
                display: false,
                text: "Probability (Real)",
              },
              grid: {
                display: false,
              },
              min: 0,
              max: 1,
            },
          },
        },
      });

      if (pieChartRef.current) {
        pieChartRef.current.destroy();
      }
      const ctx2 = document.getElementById("pieChart").getContext("2d");
      pieChartRef.current = new Chart(ctx2, {
        type: "pie",
        data: {
          labels: ["Real", "Fake"],
          datasets: [
            {
              data: [realCount, fakeCount],
              backgroundColor: ["#9B90D2", "#CCCCCC"],
            },
          ],
        },
        options: {
          responsive: false,
          plugins: {
            afterDraw: function (chart) {
              const ctx = chart.ctx;
              const meta = chart.getDatasetMeta(0);
              const fakePercentage = (fakeCount / (fakeCount + realCount)) * 100;
              const fakeAngle = (fakePercentage / 100) * 2 * Math.PI;

              if (fakePercentage > 30) {
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#FF0000';
                ctx.setLineDash([5, 5]);

                const chartArea = chart.chartArea;
                const centerX = (chartArea.left + chartArea.right) / 2;
                const centerY = (chartArea.top + chartArea.bottom) / 2;
                const outerRadius = chart.getDatasetMeta(0).data[0].outerRadius;

                ctx.arc(centerX, centerY, outerRadius, 0, fakeAngle);
                ctx.stroke();
                ctx.restore();
              }
            },
          },
        },
      });
    }
  }, [predictions, fakeCount, realCount]);

  return (
    <div className={styles.previewContext}>
      <div style={{ padding: "0 200px", background: "#fff" }}>
        <Navbar />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.block}>
          <div style={{ height: "100px" }} />
          <h1>Try Voice Verity</h1>
          <h2>
            Voice Verity에서는 실시간 통화 중 딥보이스를 감지할 수 있습니다.
          </h2>
          <h2>Fake Voice를 탐지하는 순간을 체험해보세요.</h2>
          <div style={{ textAlign: "-webkit-center" }}>
            <form onSubmit={handleSubmit}>
              <div className={styles.radioButtons}>
                <label>
                  <input
                    type="radio"
                    value="file"
                    checked={inputType === "file"}
                    onChange={() => setInputType("file")}
                  />
                  File
                </label>
                <label>
                  <input
                    type="radio"
                    value="url"
                    checked={inputType === "url"}
                    onChange={() => setInputType("url")}
                  />
                  URL
                </label>
              </div>

              {inputType === "file" ? (
                <div className={styles.form}>
                  {fileName ? (
                    <span
                      className={styles.fileName}
                      onClick={() => document.getElementById("upload").click()}
                    >
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
                    onClick={handleUploadClick}
                    onChange={handleFileChange}
                    className={styles.uploadHidden}
                  />
                </div>
              ) : (
                <div className={styles.form}>
                  <label className={styles.youtubeLabel}>YouTube URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Put here your URL."
                    className={styles.input}
                  />
                  <button type="button" className={styles.clearButton} onClick={() => setUrl('')}>
                    clear
                  </button>
                </div>
              )}

              <h2>{inputType === "file" ? "음성파일을 업로드한 뒤," : "URL을 입력한 뒤,"} Start Detection 버튼을 눌러주세요</h2>
              <p style={{ color: "#666" }}>
                {inputType === "file" ? "200MB 이내의 음성 파일로 제한(파일: .wav, .mp3, .mp4)" : "영상의 길이가 길수록 분석 시간이 오래 소요됩니다!"}
              </p>
              <button type="submit">▶ Start Detection</button>
            </form>
          </div>
          {loading && <p>분석중...</p>}
          {predictions.length > 0 && (
            <div className={styles.resultContext}>
              <h1>Detect Report</h1>
              <h2>Voice Verity는 이렇게 분석했어요.</h2>
              <div style={{ textAlign: "-webkit-center" }}>
                <div className={styles.chartContainer}>
                  <div>
                    <p>구간별 Fake 확률 그래프(0(R) ~ 1(F))</p>
                    <canvas
                      id="lineChart"
                      style={{
                        width: "400px",
                        height: "200px",
                        border: "solid 1px #000",
                      }}
                      className={styles.chart}
                    ></canvas>
                  </div>
                  <div className={styles.piechart}>
                    <p style={{ textAlign: "center" }}>Real/Fake Ratio</p>
                    <div>
                      <canvas
                        id="pieChart"
                        width="260px"  // 30% 확대
                        height="260px"  // 30% 확대
                        className={styles.chart}
                      ></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ margin: "20px", fontSize: "24px" }}>▼</div>
              <div className={styles.resultTxt}>
                <h2>이 {inputType === "file" ? "음성 파일" : "유튜브 영상"}은 {result} 입니다.</h2>
              </div>
            </div>
          )}
          <div className={styles.plan}>
            <h2>우리의 더 나은 서비스를 원하시나요?</h2>
            <button onClick={handleSubscriptionPlan}>구독플랜 보기</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
