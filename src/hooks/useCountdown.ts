import { useEffect, useState } from 'react';
import { useInterval } from './useInterval';

export const useCountdown = (seconds: number, running: boolean): [number, () => void] => {
  const [count, setCount] = useState(seconds);

  useInterval(
    () => {
      setCount((old) => (old <= 0 ? 0 : old - 1));
    },
    running ? 1000 : null,
  );

  useEffect(() => {
    if (!running) {
      setCount(seconds);
    }
  }, [running, seconds]);

  const reset = () => setCount(seconds);
  return [count, reset];
};
