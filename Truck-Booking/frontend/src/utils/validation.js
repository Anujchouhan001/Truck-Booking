// Email validation
export const isValidEmail = (email) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Phone validation (Indian format - 10 digits)
export const isValidPhone = (phone) => {
    if (!phone) return false;
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Indian phone: 10 digits, optionally starting with +91 or 91
    return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
};

// Password validation
export const getPasswordStrength = (password) => {
    return {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
};

export const isPasswordValid = (password) => {
    const strength = getPasswordStrength(password);
    return Object.values(strength).every(Boolean);
};
