'use client';

import { useEffect } from 'react';

interface ClientRedirectProps {
  url: string;
  delay?: number;
}

export function ClientRedirect({ url, delay = 1000 }: ClientRedirectProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = url;
    }, delay);

    return () => clearTimeout(timer);
  }, [url, delay]);

  return null;
}