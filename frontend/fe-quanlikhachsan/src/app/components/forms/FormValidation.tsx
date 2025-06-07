'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './FormValidation.module.css';

// Validation rules
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  phone?: boolean;
  password?: boolean;
  confirmPassword?: string; // field name to match
}

export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  rules?: ValidationRule;
  options?: { value: string; label: string }[]; // for select
  rows?: number; // for textarea
}

interface FormValidationProps {
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

// Validation functions
const validators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Trường này là bắt buộc';
    }
    return null;
  },

  minLength: (value: string, min: number) => {
    if (value && value.length < min) {
      return `Tối thiểu ${min} ký tự`;
    }
    return null;
  },

  maxLength: (value: string, max: number) => {
    if (value && value.length > max) {
      return `Tối đa ${max} ký tự`;
    }
    return null;
  },

  pattern: (value: string, pattern: RegExp) => {
    if (value && !pattern.test(value)) {
      return 'Định dạng không hợp lệ';
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Email không hợp lệ';
    }
    return null;
  },

  phone: (value: string) => {
    const phoneRegex = /^(\+84|0)[3-9]\d{8}$/;
    if (value && !phoneRegex.test(value)) {
      return 'Số điện thoại không hợp lệ';
    }
    return null;
  },

  password: (value: string) => {
    if (value && value.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    }
    return null;
  },
};

export default function FormValidation({
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = 'Gửi',
  isSubmitting = false,
  className = '',
}: FormValidationProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Initialize values
  useEffect(() => {
    const defaultValues: Record<string, any> = {};
    fields.forEach(field => {
      if (initialValues[field.name] !== undefined) {
        defaultValues[field.name] = initialValues[field.name];
      } else {
        defaultValues[field.name] = field.type === 'number' ? 0 : '';
      }
    });
    setValues(defaultValues);
  }, [fields, initialValues]);

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const field = fields.find(f => f.name === fieldName);
    if (!field?.rules) return null;

    const rules = field.rules;

    // Required validation
    if (rules.required) {
      const error = validators.required(value);
      if (error) return error;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return null;

    // Length validations
    if (rules.minLength) {
      const error = validators.minLength(value, rules.minLength);
      if (error) return error;
    }

    if (rules.maxLength) {
      const error = validators.maxLength(value, rules.maxLength);
      if (error) return error;
    }

    // Pattern validation
    if (rules.pattern) {
      const error = validators.pattern(value, rules.pattern);
      if (error) return error;
    }

    // Email validation
    if (rules.email) {
      const error = validators.email(value);
      if (error) return error;
    }

    // Phone validation
    if (rules.phone) {
      const error = validators.phone(value);
      if (error) return error;
    }

    // Password validation
    if (rules.password) {
      const error = validators.password(value);
      if (error) return error;
    }

    // Confirm password validation
    if (rules.confirmPassword) {
      const originalPassword = values[rules.confirmPassword];
      if (value !== originalPassword) {
        return 'Mật khẩu xác nhận không khớp';
      }
    }

    // Custom validation
    if (rules.custom) {
      const error = rules.custom(value);
      if (error) return error;
    }

    return null;
  }, [fields, values]);

  const handleChange = (fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Real-time validation for touched fields
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field.name, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {})
    );

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const renderField = (field: FieldConfig) => {
    const hasError = touched[field.name] && errors[field.name];
    const isValid = touched[field.name] && !errors[field.name] && values[field.name];

    return (
      <div key={field.name} className={styles.fieldGroup}>
        <label htmlFor={field.name} className={styles.label}>
          {field.label}
          {field.rules?.required && <span className={styles.required}>*</span>}
        </label>

        <div className={styles.inputWrapper}>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={values[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              className={`${styles.input} ${styles.textarea} ${
                hasError ? styles.error : isValid ? styles.valid : ''
              }`}
              disabled={isSubmitting}
            />
          ) : field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={values[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              className={`${styles.input} ${styles.select} ${
                hasError ? styles.error : isValid ? styles.valid : ''
              }`}
              disabled={isSubmitting}
            >
              <option value="">Chọn {field.label.toLowerCase()}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={
                field.type === 'password' 
                  ? (showPasswords[field.name] ? 'text' : 'password')
                  : field.type || 'text'
              }
              value={values[field.name] || ''}
              onChange={(e) => handleChange(
                field.name, 
                field.type === 'number' ? Number(e.target.value) : e.target.value
              )}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              className={`${styles.input} ${
                hasError ? styles.error : isValid ? styles.valid : ''
              }`}
              disabled={isSubmitting}
            />
          )}

          {/* Password toggle */}
          {field.type === 'password' && (
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => togglePasswordVisibility(field.name)}
              disabled={isSubmitting}
            >
              {showPasswords[field.name] ? <FaEyeSlash /> : <FaEye />}
            </button>
          )}

          {/* Validation icons */}
          {touched[field.name] && (
            <div className={styles.validationIcon}>
              {hasError ? (
                <FaTimes className={styles.errorIcon} />
              ) : values[field.name] ? (
                <FaCheck className={styles.successIcon} />
              ) : null}
            </div>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <span className={styles.errorMessage}>{errors[field.name]}</span>
        )}

        {/* Help text for password */}
        {field.type === 'password' && field.rules?.password && !hasError && (
          <span className={styles.helpText}>
            Ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số
          </span>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${className}`}>
      {fields.map(renderField)}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
      >
        {isSubmitting ? 'Đang xử lý...' : submitLabel}
      </button>
    </form>
  );
}