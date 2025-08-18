import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Configure DOMPurify to allow safe HTML elements
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'a', 'img', 'div', 'span', 'pre', 'code'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style']
  };
  
  return DOMPurify.sanitize(html, config);
};

/**
 * Creates a safe dangerouslySetInnerHTML object
 * @param html - The HTML string to sanitize
 * @returns Object with __html property containing sanitized HTML
 */
export const createSafeHtml = (html: string) => {
  return {
    __html: sanitizeHtml(html)
  };
};