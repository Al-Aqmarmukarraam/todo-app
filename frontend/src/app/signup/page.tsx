// Registration page component
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm/AuthForm';
import { useAuth } from '@/auth';

const SignupPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // If user is already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  const handleSwitchToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <AuthForm mode="signup" onSwitchMode={handleSwitchToLogin} />
      </div>
    </div>
  );
};

export default SignupPage;