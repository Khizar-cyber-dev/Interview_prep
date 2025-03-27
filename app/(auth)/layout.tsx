"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/actions/auth.action';
import { Toaster } from 'sonner';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsUserAuthenticated(authStatus);

      if (authStatus) {
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <>
      <div className="auth-layout">
        <Toaster position='top-right' />
      {children}
      </div>
    </>
  )
};

export default AuthLayout;
