import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function SupportedFiles() {
  return (
    <div>
      <Navbar />
      <h1>지원 파일</h1>
      <div>
        <h2>파일 안내</h2>
        <p>Voice Verity는 음성 파일에 대해 Deep Fake 여부를 판별합니다.</p>
        <h3>지원 파일</h3>
        <p>이용 가능한 음성 파일은 다음과 같습니다. (추후 추가될 예정)</p>
        <ul>
          <li>MP3: .mp3</li>
          <li>WAV: .wav</li>
          <li>M4A: .m4a</li>
        </ul>
        <h3>파일 사이즈</h3>
        <p>이용 가능한 음성 파일은 다음과 같습니다:</p>
        <ul>
          <li>10MB 이하의 음성 파일</li>
          <li>초과 시 정확도에 영향을 미치거나 Detect가 불가능할 수 있음</li>
        </ul>
        <Link href="/docs/user-guide" legacyBehavior>
          <a>이용 방법</a>
        </Link>
      </div>
    </div>
  );
}
