import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function UsageGuide() {
  return (
    <div>
      <Navbar />
      <h1>이용 방법</h1>
      <div>
        <h2>이용 안내</h2>
        <p>Voice Verity는 KT AivleSchool 5기 AI Track 8조가 제공하는 API 및 플랫폼 서비스입니다.</p>
        <h3>인증</h3>
        <p>플랫폼에 회원가입 및 로그인하여 API 키를 발급받습니다.</p>
        <pre>Authorization: Bearer YOUR_API_KEY</pre>
        <h3>엔드 포인트</h3>
        <h4>1. 판별(Decision)</h4>
        <pre>
          {`URL: /api/decision
Method: POST
설명: 업로드한 음성 파일을 기반으로 AI 모델로부터 Fake 여부를 판단합니다.
요청 형식(json):
{
  "data": [
    {
      "feature1": value1,
      "feature2": value2,
      "feature3": value3
    }
  ]
}
응답(json):
{
  "prediction": [예측값1, 예측값2, ...]
}`}
        </pre>
        <h4>2. 상태(Status)</h4>
        <pre>
          {`URL: /api/status
Method: GET
설명: 호출하는 API 모델의 상태를 확인합니다.
응답(json):
{
  "status": "ready",
  "version": "1.0.0"
}`}
        </pre>
        <h3>에러 코드</h3>
        <ul>
          <li>400 Bad Request: 잘못된 요청 형식입니다.</li>
          <li>401 Unauthorized: 인증 실패입니다. 올바른 API 키를 제공하십시오.</li>
          <li>403 Forbidden: 접근 권한이 없습니다.</li>
          <li>404 Not Found: 요청한 리소스를 찾을 수 없습니다.</li>
          <li>500 Internal Server Error: 서버에 문제가 발생했습니다.</li>
        </ul>
        <h3>예제 코드</h3>
        <h4>Python 예제</h4>
        <pre>
          {`import requests
url = "http://yourapiurl.com/api/decision"
headers = {
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json"
}
data = {
  "data": [
    {
      "feature1": 10,
      "feature2": 5,
      "feature3": 3
    }
  ]
}
response = requests.post(url, headers=headers, json=data)
print(response.json())`}
        </pre>
        <h4>JavaScript 예제</h4>
        <pre>
          {`fetch("http://yourapiurl.com/api/decision", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    data: [
      {
        "feature1": 10,
        "feature2": 5,
        "feature3": 3
      }
    ]
  })
})
.then(response => response.json())
.then(data => console.log(data));`}
        </pre>
        <Link href="/docs/supported-file" legacyBehavior>
          <a>지원 파일</a>
        </Link>
      </div>
    </div>
  );
}
