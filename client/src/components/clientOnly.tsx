'use client';

import React, { useEffect, useState } from 'react';

type ClientOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
};

const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  fallback = null,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <div className={className}>{children}</div>;
};

export default ClientOnly;
