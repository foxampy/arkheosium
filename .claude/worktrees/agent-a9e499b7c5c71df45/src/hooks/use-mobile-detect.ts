import { useState, useEffect } from 'react';

// Hook для определения мобильного устройства
export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  
  useEffect(() => {
    // Обработчик изменения размера окна
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Проверка начального состояния
    handleResize();
    
    // Добавляем обработчик при монтировании
    window.addEventListener('resize', handleResize);
    
    // Удаляем обработчик при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return isMobile;
}