import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button, Input, FormRow, Select, PageTransition } from '../../lib/ui';
import { useToast } from '../../lib/ui';

export const Signup: React.FC = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      addToast({
        type: 'error',
        message: 'Passwords do not match'
      });
      setLoading(false);
      return;
    }
    
    // TODO(Supabase): Replace with actual auth
    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'info',
        message: 'Auth will be wired to Supabase in Phase 2'
      });
    }, 1000);
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && 
                     formData.password && formData.confirmPassword && 
                     formData.password === formData.confirmPassword;

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'staff', label: 'Staff' }
  ];

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
            <p className="text-gray-600">Join EWU Hub to start booking resources</p>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="First Name" required>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="First name"
                      className="pl-10"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                </FormRow>

                <FormRow label="Last Name" required>
                  <Input
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </FormRow>
              </div>

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

              <FormRow label="Role" required>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  options={roleOptions}
                />
              </FormRow>

              <FormRow label="Password" required>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Create password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
              </FormRow>

              <FormRow label="Confirm Password" required>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </FormRow>

              <div className="text-xs text-gray-600">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a> and{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isFormValid}
                loading={loading}
                className="w-full"
              >
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign in
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