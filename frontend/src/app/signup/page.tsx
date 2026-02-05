// Registration page component
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm/AuthForm';

const SignupPage: React.FC = () => {
  const router = useRouter();

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