// Form helper utilities

/**
 * Extracts data from form as an object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Object with form data
 */
export function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
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

