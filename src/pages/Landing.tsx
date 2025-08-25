import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  FlaskConical, 
  Calendar, 
  Users,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Button, PageTransition } from '../lib/ui';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Library Booking',
      description: 'Reserve seats in Library 601 with real-time availability'
    },
    {
      icon: FlaskConical,
      title: 'Lab Equipment',
      description: 'Book equipment units for engineering and CSE labs'
    },
    {
      icon: Calendar,
      title: 'Class Scheduling',
      description: 'Faculty can book extra classes and manage schedules'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Students, faculty, staff, and admin portals'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Live booking status and attendance tracking'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Role-based access control and audit logs'
    }
  ];

  const stats = [
    { label: 'Active Bookings', value: '2,500+' },
    { label: 'Happy Students', value: '15,000+' },
    { label: 'Lab Sessions', value: '800+' },
    { label: 'Success Rate', value: '99.9%' }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        {/* Header */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">EWU Hub</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                  Smart University
                  <span className="text-purple-600 block">Booking System</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Streamline your university experience with intelligent booking management for libraries, labs, and classrooms. Built for East West University.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <Link to="/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      Start Booking Today
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Sign In to Continue
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need to manage bookings
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From library seats to lab equipment, our comprehensive platform handles all your university booking needs with ease.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to transform your university experience?
              </h2>
              <p className="text-purple-100 text-lg mb-8">
                Join thousands of students and faculty who are already using EWU Hub to streamline their bookings.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">EWU Hub</span>
              </div>
              <p className="text-gray-400 text-sm">
                © 2025 EWU Hub. Built for Eastern Washington University.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};