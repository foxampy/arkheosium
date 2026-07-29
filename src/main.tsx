import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

// Vite сообщает о неудачной предзагрузке чанка отдельным событием. Без
// preventDefault оно всплывает как необработанная ошибка ещё до того, как
// сработает повтор в lazyRoute. Гасим его здесь — восстановлением занимается
// lazyRoute, и делать это дважды не нужно.
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault();
  console.warn('[preload] чанк не предзагрузился; повтор берёт на себя lazyRoute');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
