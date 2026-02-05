// Login page component
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm/AuthForm';

const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleSwitchToSignup = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <AuthForm mode="login" onSwitchMode={handleSwitchToSignup} />
      </div>
    </div>
  );
};

export default LoginPage;