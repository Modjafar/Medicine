import { useState, useCallback } from 'react';

/**
 * useForm - Reusable form validation hook
 * 
 * Handles form state, validation, and submission with inline error display.
 * 
 * @param {object} initialValues - Initial form values
 * @param {object} validationRules - Validation rules per field
 * @param {function} onSubmit - Submit handler (receives values)
 * 
 * @returns {object} {
 *   values,           // Current form values
 *   errors,           // Validation errors object
 *   touched,          // Fields that have been blurred
 *   isSubmitting,     // Whether form is being submitted
 *   handleChange,     // Input change handler
 *   handleBlur,       // Input blur handler (triggers validation)
 *   handleSubmit,     // Form submit handler
 *   setValues,        // Manually set values
 *   resetForm,        // Reset to initial values
 *   setFieldError,    // Manually set an error for a field
 *   clearErrors       // Clear all errors
 * }
 * 
 * Usage:
 *   const { values, errors, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm(
 *     { email: '', password: '' },
 *     {
 *       email: { required: true, email: true },
 *       password: { required: true, minLength: 6 }
 *     },
 *     async (values) => { await login(values); }
 *   );
 */
const useForm = (initialValues = {}, validationRules = {}, onSubmit) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Validate a single field value against its rules
     */
    const validateField = useCallback((name, value) => {
        const rules = validationRules[name];
        if (!rules) return '';

        // Required check
        if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            return rules.requiredMessage || `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        }

        // Skip other checks if value is empty and not required
        if (!value && !rules.required) return '';

        const stringValue = String(value).trim();

        // Email format
        if (rules.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(stringValue)) {
                return 'Please enter a valid email address';
            }
        }

        // Min length
        if (rules.minLength && stringValue.length < rules.minLength) {
            return `Must be at least ${rules.minLength} characters`;
        }

        // Max length
        if (rules.maxLength && stringValue.length > rules.maxLength) {
            return `Must be no more than ${rules.maxLength} characters`;
        }

        // Min value (for numbers)
        if (rules.min !== undefined && Number(value) < rules.min) {
            return `Must be at least ${rules.min}`;
        }

        // Max value (for numbers)
        if (rules.max !== undefined && Number(value) > rules.max) {
            return `Must be no more than ${rules.max}`;
        }

        // Match another field (e.g., password confirmation)
        if (rules.match) {
            const matchValue = values[rules.match];
            if (stringValue !== matchValue) {
                return rules.matchMessage || 'Fields do not match';
            }
        }

        // Custom validator
        if (rules.validate && typeof rules.validate === 'function') {
            const customError = rules.validate(value, values);
            if (customError) return customError;
        }

        return '';
    }, [validationRules, values]);

    /**
     * Validate all fields, return true if valid
     */
    const validateAll = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach((field) => {
            const error = validateField(field, values[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        setTouched(
            Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );

        return isValid;
    }, [validateField, validationRules, values]);

    /**
     * Handle input change
     */
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setValues((prev) => ({ ...prev, [name]: newValue }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    /**
     * Handle input blur - validate the field
     */
    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error || undefined,
        }));
    }, [validateField]);

    /**
     * Handle form submission
     */
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        if (!validateAll()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            await onSubmit(values);
        } catch (submitError) {
            // If submit returns field errors, display them
            if (submitError.fieldErrors) {
                setErrors(submitError.fieldErrors);
            }
            // Re-throw for outer handler (e.g., toast notification)
            throw submitError;
        } finally {
            setIsSubmitting(false);
        }
    }, [validateAll, onSubmit, values]);

    /**
     * Reset form to initial values
     */
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    /**
     * Manually set a field error
     */
    const setFieldError = useCallback((field, message) => {
        setErrors((prev) => ({ ...prev, [field]: message }));
    }, []);

    /**
     * Clear all errors
     */
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        setValues,
        resetForm,
        setFieldError,
        clearErrors,
    };
};

export default useForm;
