'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function PrefetchLink({ href, children, ...props }) {
  const router = useRouter();
  const prefetched = useRef(false);
  const timer = useRef(null);

  const prefetch = () => {
    if (prefetched.current) return;
    timer.current = setTimeout(() => {
      if (typeof href === 'string') router.prefetch(href);
      prefetched.current = true;
    }, 150);
  };

  const cancelPrefetch = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <NextLink
      href={href}
      {...props}
      prefetch={false}
      onMouseEnter={(e) => {
        prefetch();
        if (props.onMouseEnter) props.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        cancelPrefetch();
        if (props.onMouseLeave) props.onMouseLeave(e);
      }}
      onFocus={(e) => {
        prefetch();
        if (props.onFocus) props.onFocus(e);
      }}
    >
      {children}
    </NextLink>
  );
}