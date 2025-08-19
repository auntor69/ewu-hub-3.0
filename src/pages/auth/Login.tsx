import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, Input, FormRow, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';

export const Login: React.FC = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO(Supabase): Replace with actual auth
    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'info',
        message: 'Auth will be wired to Supabase in Phase 2'
      });
    }, 1000);
  };

  const isFormValid = formData.email && formData.password;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">EWU Hub</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormRow label="Email Address" required>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </FormRow>

              <FormRow label="Password" required>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
              </FormRow>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isFormValid}
                loading={loading}
                className="w-full"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link to="/" className="text-gray-600 hover:text-purple-600 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};