'use client';
import { motion } from 'framer-motion';
import { 
  IconMicrophone, IconBrain, IconTicket, IconArrowRight, 
  IconRocket, IconDeviceLaptop, IconChartBar, IconCheck 
} from '@tabler/icons-react';
import Link from 'next/link';
import Logo from '@/components/common/Logo';

export default function Page() {
  const features = [
    {
      icon: IconMicrophone,
      title: 'Voice Recording',
      description: 'Crystal clear audio with noise cancellation'
    },
    {
      icon: IconBrain,
      title: 'AI Transcription',
      description: 'Real-time transcription with 99% accuracy'
    },
    {
      icon: IconTicket,
      title: 'Smart Tickets',
      description: 'Automated task generation from discussions'
    },
    {
      icon: IconDeviceLaptop,
      title: 'Cross-Platform',
      description: 'Work seamlessly across all your devices'
    },
    {
      icon: IconChartBar,
      title: 'Analytics',
      description: 'Deep insights into meeting productivity'
    },
    {
      icon: IconRocket,
      title: 'Instant Deploy',
      description: 'Set up in minutes, not hours'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl border-b border-[#E8E4D9] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Logo size="medium" />
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/login" className="text-[#2F2A20] hover:text-[#2F2A20]/80 transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-[#2F2A20] text-white px-6 py-2 rounded-xl hover:bg-[#2F2A20]/90 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl font-bold text-[#2F2A20] mb-6 leading-tight">
              The Future of Meeting Management is Here
            </h1>
            <p className="text-xl text-[#2F2A20]/60 mb-12">
              Transform your meetings with AI-powered transcription, automated task generation, 
              and intelligent insights. Welcome to 2025.
            </p>
            <motion.div 
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="/signup"
                className="group bg-[#2F2A20] text-white px-8 py-4 rounded-xl text-lg hover:bg-[#2F2A20]/90 transition-all hover:scale-105 flex items-center gap-2"
              >
                Get Started Free
                <IconArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="bg-[#E8E4D9] text-[#2F2A20] px-8 py-4 rounded-xl text-lg hover:bg-[#E8E4D9]/80 transition-all hover:scale-105"
              >
                Watch Demo
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-32">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-[#E8E4D9] hover:border-[#2F2A20]/20 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="bg-[#2F2A20]/5 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon size={24} className="text-[#2F2A20]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2F2A20] mb-2">{feature.title}</h3>
                <p className="text-[#2F2A20]/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-40 text-center"
          >
            <h2 className="text-4xl font-bold text-[#2F2A20] mb-20">Trusted by Industry Leaders</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center opacity-60">
              <img src="/logos/company1.svg" alt="Company 1" />
              <img src="/logos/company2.svg" alt="Company 2" />
              <img src="/logos/company3.svg" alt="Company 3" />
              <img src="/logos/company4.svg" alt="Company 4" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-40"
          >
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-[#2F2A20] mb-6">Pricing Plans</h2>
              <p className="text-xl text-[#2F2A20]/60">Choose the perfect plan for your team</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Starter',
                  price: '$0',
                  features: ['Up to 5 team members', '3 meetings/month', 'Basic transcription']
                },
                {
                  name: 'Pro',
                  price: '$29',
                  features: ['Up to 20 team members', 'Unlimited meetings', 'Advanced AI features']
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  features: ['Unlimited team members', 'Custom integrations', '24/7 support']
                }
              ].map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl border border-[#E8E4D9] hover:border-[#2F2A20]/20 transition-all hover:shadow-lg"
                >
                  <h3 className="text-2xl font-bold text-[#2F2A20] mb-4">{plan.name}</h3>
                  <p className="text-4xl font-bold text-[#2F2A20] mb-8">{plan.price}</p>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-[#2F2A20]/80">
                        <IconCheck size={20} className="text-[#2F2A20]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 rounded-xl bg-[#2F2A20] text-white hover:bg-[#2F2A20]/90 transition-colors">
                    Get Started
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-40 mb-20"
          >
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-[#2F2A20] mb-6">Ready to Transform Your Meetings?</h2>
              <p className="text-xl text-[#2F2A20]/60 mb-8">Join thousands of teams already using VORI</p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#2F2A20] text-white px-8 py-4 rounded-xl hover:bg-[#2F2A20]/90 transition-all hover:scale-105"
              >
                Get Started Free
                <IconArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
