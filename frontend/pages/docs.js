import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Docs() {
  return (
    <div>
      <Navbar />
      <h1>문서</h1>
      <ul>
        <li>
          <Link href="/docs/supported-file">지원 파일</Link>
        </li>
        <li>
          <Link href="/docs/user-guide">이용 방법</Link>
        </li>
      </ul>
    </div>
  );
}
