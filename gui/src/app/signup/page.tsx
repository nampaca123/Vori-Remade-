'use client';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo size="large" className="mb-4" />
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E8E4D9]">
          <h1 className="text-3xl font-bold text-center mb-2">Create account</h1>
          <p className="text-center text-[#2F2A20]/60 mb-8">Start managing your meetings efficiently</p>
          
          <div className="space-y-6">
            <GoogleSignInButton text="Sign up with Google" />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E4D9]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#2F2A20]/60">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#2F2A20] font-medium">First Name</label>
                  <input 
                    type="text"
                    placeholder="Enter your first name"
                    className="w-full mt-2 p-3 rounded-xl border border-[#E8E4D9] focus:outline-none focus:border-[#2F2A20] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#2F2A20] font-medium">Last Name</label>
                  <input 
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full mt-2 p-3 rounded-xl border border-[#E8E4D9] focus:outline-none focus:border-[#2F2A20] transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[#2F2A20] font-medium">Email</label>
                <input 
                  type="email"
                  placeholder="Enter your email"
                  className="w-full mt-2 p-3 rounded-xl border border-[#E8E4D9] focus:outline-none focus:border-[#2F2A20] transition-colors"
                />
              </div>
              
              <div>
                <label className="text-[#2F2A20] font-medium">Password</label>
                <input 
                  type="password"
                  placeholder="Create a password"
                  className="w-full mt-2 p-3 rounded-xl border border-[#E8E4D9] focus:outline-none focus:border-[#2F2A20] transition-colors"
                />
              </div>
              
              <div>
                <label className="text-[#2F2A20] font-medium">Confirm Password</label>
                <input 
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full mt-2 p-3 rounded-xl border border-[#E8E4D9] focus:outline-none focus:border-[#2F2A20] transition-colors"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2F2A20] text-white py-3 rounded-xl hover:bg-[#2F2A20]/90 transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-[#2F2A20]/60">
            Already have an account? <a href="/login" className="text-[#2F2A20] hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
} 