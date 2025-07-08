import { useEffect } from 'react';

const useEscapeKey = (callback) => {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [callback]);
};

export default useEscapeKey; 