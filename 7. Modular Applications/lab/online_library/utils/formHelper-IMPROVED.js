// Form helper utilities - IMPROVED VERSION
// Demonstrates: Input sanitization, validation, error handling

/**
 * Sanitizes a string value
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
function sanitizeString(value) {
    if (typeof value !== 'string') return value;
    return value.trim();  // Remove leading/trailing whitespace
}

/**
 * Extracts data from form as an object with sanitization
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Object with sanitized form data
 */
export function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        // ✅ BEST PRACTICE: Sanitize input
        data[key] = sanitizeString(value);
    }
    
    return data;
}

/**
 * Validates book data
 * @param {Object} data - Book data to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateBookData(data) {
    const errors = [];
    
    // Title validation
    if (!data.title || data.title.length === 0) {
        errors.push('Title is required');
    } else if (data.title.length < 3) {
        errors.push('Title must be at least 3 characters');
    } else if (data.title.length > 200) {
        errors.push('Title must be less than 200 characters');
    }
    
    // Author validation
    if (!data.author || data.author.length === 0) {
        errors.push('Author is required');
    } else if (data.author.length < 2) {
        errors.push('Author name must be at least 2 characters');
    } else if (data.author.length > 100) {
        errors.push('Author name must be less than 100 characters');
    }
    
    // Year validation
    const year = parseInt(data.year);
    const currentYear = new Date().getFullYear();
    if (!data.year || isNaN(year)) {
        errors.push('Year is required and must be a number');
    } else if (year < 1900) {
        errors.push('Year must be 1900 or later');
    } else if (year > currentYear) {
        errors.push(`Year cannot be in the future (max: ${currentYear})`);
    }
    
    // Description is optional, but if provided, validate length
    if (data.description && data.description.length > 1000) {
        errors.push('Description must be less than 1000 characters');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Extracts field value by ID
 * @param {string} id - Field ID
 * @returns {string} Field value
 */
export function getFieldValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

/**
 * Clears a form
 * @param {string} formId - Form ID
 */
export function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

/**
 * Sets form field error state
 * @param {string} fieldId - Field ID
 * @param {string} errorMessage - Error message to display
 */
export function setFieldError(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }
}

/**
 * Clears form field error state
 * @param {string} fieldId - Field ID
 */
export function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('error');
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
}

