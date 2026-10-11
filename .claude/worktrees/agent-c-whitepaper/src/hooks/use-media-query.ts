import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Устанавливаем начальное состояние
      setMatches(media.matches);
      
      // Функция для обработки изменений
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Добавляем слушатель изменений
      media.addEventListener('change', listener);
      
      // Очистка при размонтировании
      return () => {
        media.removeEventListener('change', listener);
      };
    }
    
    return undefined;
  }, [query]);
  
  return matches;
}