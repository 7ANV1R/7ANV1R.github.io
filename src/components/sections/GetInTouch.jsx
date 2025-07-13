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
    } catch (err) {
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto mt-16 mb-24 px-4"
      data-section="get-in-touch"
    >
      <Snackbar
        open={snackbarOpen}
        message="Your message has been sent!"
        onClose={() => setSnackbarOpen(false)}
      />
      <div className="mb-16 text-left">
        <SectionTitle primaryText="GET IN" secondaryText="TOUCH" />
      </div>
      <form
        className="space-y-10 text-left"
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
        {/* Name */}
        <div>
          <label
            className="flex items-center gap-2 text-h4 font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            <AnimatedLabelIcon type="user" size={16} />
            Name*
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-paragraph placeholder-gray-500 focus:outline-none focus:border-accent transition-all"
            autoComplete="off"
            required
            disabled={submitting}
          />
        </div>
        {/* Email */}
        <div>
          <label
            className="flex items-center gap-2 text-h4 font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            <AnimatedLabelIcon type="mail" size={16} />
            Email*
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="exemple@mail.com"
            className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-paragraph placeholder-gray-500 focus:outline-none focus:border-accent transition-all"
            autoComplete="off"
            required
            disabled={submitting}
          />
        </div>
        {/* Message */}
        <div>
          <label
            className="flex items-center gap-2 text-h4 font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            <AnimatedLabelIcon type="message" size={16} />
            Message*
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell me more about your project. Don’t hesitate to include links if necessary."
            className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-paragraph placeholder-gray-500 focus:outline-none focus:border-accent transition-all min-h-[120px] resize-none"
            required
            disabled={submitting}
          />
        </div>
        <button
          type="submit"
          className="w-full py-4 mt-4 rounded-lg border border-accent bg-accent text-black font-bold text-lg tracking-widest hover:bg-transparent hover:text-accent transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          disabled={submitting}
        >
          {submitting ? 'SENDING...' : 'SEND MESSAGE'}
        </button>
      </form>
    </div>
  );
};

export default GetInTouch;
