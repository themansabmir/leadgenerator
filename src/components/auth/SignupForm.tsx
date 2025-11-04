/**
 * Signup Form Component
 * Registration form component with validation and error handling using shadcn/ui
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SignupCredentials } from '@/types/auth';
import { validateSignupCredentials } from '@/lib/auth/validation';

/**
 * Signup Form Component
 */
export const SignupForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, error: authError, clearError } = useAuth();
  const router = useRouter();
  
  const form = useForm<SignupCredentials>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  /**
   * Toggles confirm password visibility
   */
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  /**
   * Handles form submission
   */
  const onSubmit = useCallback(async (values: SignupCredentials) => {
    // Clear any previous auth errors
    if (authError) {
      clearError();
    }

    // Client-side validation
    const validation = validateSignupCredentials(values);
    if (!validation.isValid) {
      Object.entries(validation.errors).forEach(([field, message]) => {
        form.setError(field as keyof SignupCredentials, { message });
      });
      return;
    }

    try {
      const result = await signup(values);
      
      if (result.success) {
        // Redirect to dashboard after successful signup
        router.push('/dashboard');
      }
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Signup error:', error);
    }
  }, [form, signup, router, authError, clearError]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to start generating leads with Lead Harvester
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (authError) clearError();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (authError) clearError();
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        disabled={isSubmitting}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (authError) clearError();
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={toggleConfirmPasswordVisibility}
                        disabled={isSubmitting}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
