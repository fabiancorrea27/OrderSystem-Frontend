import { useState, useEffect, useCallback } from 'react';
import styles from './Toast.module.css';

export interface ToastData {
  msg: string;
  type: 'success' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [exiting, setExiting] = useState(false);

  const show = useCallback((msg: string, type: 'success' | 'error') => {
    setExiting(false);
    setToast({ msg, type });
  }, []);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setToast(null);
      setExiting(false);
    }, 250);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(dismiss, 3000);
    return () => clearTimeout(id);
  }, [toast, dismiss]);

  return { toast, exiting, show, dismiss };
}

export default function Toast({ data, exiting }: { data: ToastData; exiting: boolean }) {
  return (
    <div className={`${styles.toast} ${styles[data.type]} ${exiting ? styles.out : styles.in}`}>
      {data.msg}
    </div>
  );
}
