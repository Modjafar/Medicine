import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

/**
 * FormInput - Reusable form input with validation error display
 * 
 * @param {string} label - Input label
 * @param {string} name - Input name attribute
 * @param {string} type - Input type (text, email, password, number, etc.)
 * @param {string} value - Current value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional CSS classes
 * @param {boolean} showToggle - Show password visibility toggle (for password type)
 * @param {object} props - Additional input props
 * 
 * Usage:
 *   <FormInput
 *     label="Email"
 *     name="email"
 *     type="email"
 *     value={email}
 *     onChange={handleChange}
 *     error={errors.email}
 *     required
 *   />
 */
const FormInput = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error = null,
    required = false,
    placeholder = '',
    className = '',
    showToggle = false,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showToggle
        ? (showPassword ? 'text' : 'password')
        : type;

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700"
                >
                    {label}
                    {required && (
                        <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
                    )}
                </label>
            )}

            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : undefined}
                    className={`
                        w-full px-3 py-2.5 border rounded-lg text-gray-900 
                        placeholder-gray-400 transition-colors
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${error
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }
                    `}
                    {...props}
                />

                {isPassword && showToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {error && (
                <ErrorMessage
                    message={error}
                    id={`${name}-error`}
                />
            )}
        </div>
    );
};

export default FormInput;
