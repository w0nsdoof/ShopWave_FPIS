import React from 'react';

// Define static params for pre-rendering
export function generateStaticParams() {
  return [
    { orderId: '1' },
    { orderId: '2' },
    { orderId: '3' },
    { orderId: '4' },
    { orderId: '5' }
  ]
}

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
