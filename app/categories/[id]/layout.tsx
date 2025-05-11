import React from 'react';

// Define static params for pre-rendering
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '19' } // Added ID 19 for static pre-rendering
  ]
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
