import { useState, useEffect } from 'react';

function getWindowDimensions() {
  //@ts-ignore
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    //@ts-ignore
    window.addEventListener('resize', handleResize);
    //@ts-ignore
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}