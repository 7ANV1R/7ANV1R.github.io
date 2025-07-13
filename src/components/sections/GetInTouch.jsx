import React, { useState } from 'react';
import SectionTitle from '../ui/SectionTitle';
import AnimatedLabelIcon from '../ui/AnimatedLabelIcon';
import Snackbar from '../ui/Snackbar';

const FORMSUBMIT_EMAIL = 'tanvir.inquiries@gmail.com';

const GetInTouch = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Prepare form data
    const data = new FormData();
    data.append('name', form.name);
    data.append('email', form.email);
    data.append('message', form.message);
    data.append('_honey', '');
    data.append('_captcha', 'false');
    // No _next for no redirect
    try {
      await fetch(`https://formsubmit.co/${FORMSUBMIT_EMAIL}`, {
        method: 'POST',
        body: data,
        headers: {
          Accept: 'application/json',
        },
      });
      setForm({ name: '', email: '', message: '' });
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Form submission error:', error);
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" data-section="get-in-touch">
      <Snackbar
        open={snackbarOpen}
        message="Message sent successfully! I'll get back to you soon."
        onClose={() => setSnackbarOpen(false)}
      />

      {/* Section Header */}
      <div className="space-y-8">
        <SectionTitle primaryText="GET IN" secondaryText="TOUCH" />
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
      </div>

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
          >
            {/* Honeypot */}
            <input
              type="text"
              name="_honey"
              style={{ display: 'none' }}
              tabIndex="-1"
              autoComplete="off"
            />
            {/* No captcha */}
            <input type="hidden" name="_captcha" value="false" />

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-3">
                <label
                  className="flex items-center gap-3 text-h6 font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <AnimatedLabelIcon type="user" size={20} />
                  Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent border-2 rounded-xl px-4 py-4 text-paragraph placeholder-gray-400 focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                      e.target.style.boxShadow = '0 0 0 3px var(--accent)20';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                    autoComplete="off"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <label
                  className="flex items-center gap-3 text-h6 font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <AnimatedLabelIcon type="mail" size={20} />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full bg-transparent border-2 rounded-xl px-4 py-4 text-paragraph placeholder-gray-400 focus:outline-none transition-all duration-300"
                    style={{
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                      e.target.style.boxShadow = '0 0 0 3px var(--accent)20';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--card-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                    autoComplete="off"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-3">
              {' '}
              <label
                className="flex items-center gap-3 text-h6 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedLabelIcon type="message" size={20} />
                Message
              </label>
              <div className="relative">
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Feel free to share your thoughts, ask questions, or just say hello! I'd love to hear from you."
                  className="w-full bg-transparent border-2 rounded-xl px-4 py-4 text-paragraph placeholder-gray-400 focus:outline-none transition-all duration-300 min-h-[140px] resize-none"
                  style={{
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 3px var(--accent)20';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--card-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                  disabled={submitting}
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
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.backgroundColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 8px 25px 0 var(--accent)50';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px 0 var(--accent)40';
                  }
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
};

export default GetInTouch;
