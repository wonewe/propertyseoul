import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

console.log('main.tsx 실행됨');
console.log('Root element:', document.getElementById('root'));

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('root 요소를 찾을 수 없습니다!');
  }
  
  const root = createRoot(rootElement);
  console.log('React root 생성됨');
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
  
  console.log('React 앱 렌더링 완료');
} catch (error) {
  console.error('앱 초기화 중 에러:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: system-ui; text-align: center;">
      <h1>❌ 초기화 에러</h1>
      <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: left; max-width: 800px; margin: 20px auto;">
        ${error instanceof Error ? error.message : String(error)}
      </pre>
      <p>브라우저 콘솔(F12)을 확인하세요.</p>
    </div>
  `;
}
