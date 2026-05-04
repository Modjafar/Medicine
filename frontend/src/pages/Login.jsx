import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
    const [submitError, setSubmitError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        values,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
    } = useForm(
        { email: '', password: '' },
        {
            email: { required: true, email: true },
            password: { required: true },
        },
        async (formValues) => {
            setSubmitError(null);
            try {
                await login(formValues.email, formValues.password);
                toast.success('Welcome back!');
                navigate('/');
            } catch (error) {
                const message = error.friendlyMessage || error.message || 'Login failed. Please try again.';
                setSubmitError(message);
                toast.error(message);
            }
        }
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Pill className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-600 mt-2">Sign in to manage your medicines</p>
                </div>

                <div className="card">
                    {submitError && (
                        <ErrorMessage 
                            message={submitError} 
                            variant="banner" 
                            onDismiss={() => setSubmitError(null)}
                            className="mb-4"
                        />
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <FormInput
                            label="Email"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.email}
                            required
                            placeholder="Enter your email"
                            autoComplete="email"
                        />

                        <FormInput
                            label="Password"
                            name="password"
                            type="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.password}
                            required
                            placeholder="Enter your password"
                            showToggle
                            autoComplete="current-password"
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            {isSubmitting ? (
                                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 font-medium hover:underline">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
