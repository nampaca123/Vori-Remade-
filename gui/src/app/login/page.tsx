'use client';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo size="large" className="mb-4" />
        </div>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E8E4D9]">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-center text-[#2F2A20]/60 mb-8">Sign in to your account</p>
          
          <div className="space-y-6">
            <GoogleSignInButton onClick={() => router.push('/dashboard')} />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E4D9]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#2F2A20]/60">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
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
                  placeholder="Enter your password"
                  className="w-full mt-2 p-3 rounded-xl border border-[#E8E4D9] focus:outline-none focus:border-[#2F2A20] transition-colors"
                />
              </div>

              <button type="submit" className="w-full bg-[#2F2A20] text-white py-3 rounded-xl hover:bg-[#2F2A20]/90 transition-colors">
                Sign in
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-[#2F2A20]/60">
            Don't have an account? <a href="/signup" className="text-[#2F2A20] hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
} 