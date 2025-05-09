import React from 'react';

// Define static params for pre-rendering
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ]
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
