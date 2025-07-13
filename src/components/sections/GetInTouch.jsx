import React, { useState, useCallback } from 'react';
import SectionTitle from '../ui/SectionTitle';
import AnimatedLabelIcon from '../ui/AnimatedLabelIcon';
import Snackbar from '../ui/Snackbar';

const FORMSUBMIT_EMAIL = 'tanvir.inquiries@gmail.com';

/**
 * GetInTouch Component
 *
 * A contact form section that allows users to send messages.
 * Features form validation, loading states, and accessibility support.
 *
 * @returns {JSX.Element} The contact form section
 */
const GetInTouch = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Memoized form change handler to prevent unnecessary re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  }, []);

  // Memoized input focus handler for consistent styling
  const handleInputFocus = useCallback((e) => {
    e.target.style.borderColor = 'var(--accent)';
    e.target.style.boxShadow = '0 0 0 3px var(--accent)20';
  }, []);

  // Memoized input blur handler for consistent styling
  const handleInputBlur = useCallback((e) => {
    e.target.style.borderColor = 'var(--card-border)';
    e.target.style.boxShadow = 'none';
  }, []);

  // Memoized button mouse enter handler
  const handleButtonMouseEnter = useCallback(
    (e) => {
      if (!submitting) {
        e.target.style.backgroundColor = 'var(--accent)';
        e.target.style.boxShadow = '0 8px 25px 0 var(--accent)50';
        e.target.style.transform = 'translateY(-2px)';
      }
    },
    [submitting],
  );

  // Memoized button mouse leave handler
  const handleButtonMouseLeave = useCallback(
    (e) => {
      if (!submitting) {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 14px 0 var(--accent)40';
      }
    },
    [submitting],
  );

  // Memoized snackbar close handler
  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      console.warn('All fields are required');
      return;
    }

    setSubmitting(true);

    // Prepare form data
    const data = new FormData();
    data.append('name', form.name.trim());
    data.append('email', form.email.trim());
    data.append('message', form.message.trim());
    data.append('_honey', '');
    data.append('_captcha', 'false');

    try {
      const response = await fetch(
        `https://formsubmit.co/${FORMSUBMIT_EMAIL}`,
        {
          method: 'POST',
          body: data,
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (response.ok) {
        setForm({ name: '', email: '', message: '' });
        setSnackbarOpen(true);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Common input styling
  const inputClassName =
    'w-full bg-transparent border-2 rounded-xl px-4 py-4 text-paragraph placeholder-gray-400 focus:outline-none transition-all duration-300';
  const inputStyle = {
    borderColor: 'var(--card-border)',
    color: 'var(--text-primary)',
  };

  return (
    <section
      className="space-y-8"
      data-section="get-in-touch"
      aria-labelledby="contact-heading"
    >
      <Snackbar
        open={snackbarOpen}
        message="Message sent successfully! I'll get back to you soon."
        onClose={handleSnackbarClose}
      />

      {/* Section Header */}
      <header className="space-y-8">
        <SectionTitle
          primaryText="GET IN"
          secondaryText="TOUCH"
          id="contact-heading"
        />
        <div className="max-w-2xl">
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Feel free to reach out if you'd like to connect, discuss technology,
            or just say hello. I'm always happy to chat with fellow developers
            and tech enthusiasts.
          </p>
        </div>
      </header>

      {/* Contact Form Card */}
      <div className="max-w-4xl">
        <div
          className="rounded-2xl p-8 lg:p-12 border transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <form
            className="space-y-8"
            onSubmit={handleSubmit}
            autoComplete="off"
            noValidate
          >
            {/* Honeypot for spam protection */}
            <input
              type="text"
              name="_honey"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            {/* Disable captcha */}
            <input type="hidden" name="_captcha" value="false" />

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-3">
                <label
                  htmlFor="contact-name"
                  className="flex items-center gap-3 text-h6 font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <AnimatedLabelIcon type="user" size={20} />
                  Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Enter your full name"
                    className={inputClassName}
                    style={inputStyle}
                    autoComplete="name"
                    required
                    disabled={submitting}
                    aria-describedby="name-error"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <label
                  htmlFor="contact-email"
                  className="flex items-center gap-3 text-h6 font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <AnimatedLabelIcon type="mail" size={20} />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="your@email.com"
                    className={inputClassName}
                    style={inputStyle}
                    autoComplete="email"
                    required
                    disabled={submitting}
                    aria-describedby="email-error"
                  />
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-3">
              <label
                htmlFor="contact-message"
                className="flex items-center gap-3 text-h6 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedLabelIcon type="message" size={20} />
                Message
              </label>
              <div className="relative">
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Feel free to share your thoughts, ask questions, or just say hello! I'd love to hear from you."
                  className={`${inputClassName} min-h-[140px] resize-none`}
                  style={inputStyle}
                  required
                  disabled={submitting}
                  rows={6}
                  aria-describedby="message-error"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 px-8 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px 0 var(--accent)40',
                }}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
                disabled={submitting}
                aria-describedby={submitting ? 'submit-status' : undefined}
              >
                {submitting ? (
                  <span
                    className="flex items-center justify-center gap-3"
                    id="submit-status"
                    aria-live="polite"
                  >
                    <div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
