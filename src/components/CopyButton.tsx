import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type CopyButtonProps = {
  value: string;
};

export function CopyButton({ value }: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function scheduleIdleReset() {
    timeoutRef.current = window.setTimeout(() => setStatus('idle'), 1200);
  }

  async function handleCopy() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (!navigator.clipboard) {
      setStatus('error');
      scheduleIdleReset();
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setStatus('success');
      scheduleIdleReset();
    } catch {
      setStatus('error');
      scheduleIdleReset();
    }
  }

  const label =
    status === 'success'
      ? 'Copied usage snippet'
      : status === 'error'
        ? 'Copy failed'
        : 'Copy usage snippet';

  return (
    <button className="icon-button" type="button" onClick={handleCopy} aria-label={label}>
      {status === 'success' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
    </button>
  );
}
