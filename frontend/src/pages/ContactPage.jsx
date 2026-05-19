import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Info, ChevronRight, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'support',
    gst: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const subjects = [
    { value: 'support', label: 'Technical Support' },
    { value: 'order', label: 'Order Inquiry' },
    { value: 'business', label: 'Business Partnership' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'feedback', label: 'General Feedback' }
  ];

  const contactOptions = [
    {
      icon: <Mail />,
      title: 'Email Us',
      detail: 'OBSIDIAN TECH.001@gmail.com',
      link: 'mailto:OBSIDIAN TECH.001@gmail.com'
    },
    {
      icon: <Phone />,
      title: 'Call Us',
      detail: '+91 6353808435',
      link: 'tel:+916353808435'
    },
    {
      icon: <MapPin />,
      title: 'Visit Us',
      detail: 'Surat, Gujarat, India',
      link: 'https://maps.google.com'
    }
  ];

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits)';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (formData.subject === 'business' && formData.gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst)) {
      newErrors.gst = 'Invalid GSTIN format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: 'support', gst: '', message: '' });
  };

  return (
    <div className="contact-page">
      <SEO
        title="Contact Us | OBSIDIAN TECH"
        description="Got questions about your order or need tech support? Contact OBSIDIAN TECH today. We're here to help you 24/7."
        url="/contact"
      />

      {/* Hero Header */}
      <div className="contact-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Get in <span className="gradient-text">Touch</span>
          </motion.h1>
          <p>We'd love to hear from you. Our team is always here to chat.</p>
        </div>
      </div>

      <div className="container contact-main-grid">
        {/* Left: Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="contact-info-panel"
        >
          <div className="info-header">
            <h2>Contact Information</h2>
            <p>Fill out the form and our team will get back to you within 24 hours.</p>
          </div>

          <div className="info-list">
            {contactOptions.map((opt, i) => (
              <a key={i} href={opt.link} target="_blank" rel="noopener noreferrer" className="info-item">
                <div className="info-icon">{opt.icon}</div>
                <div className="info-text">
                  <span>{opt.title}</span>
                  <p>{opt.detail}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="social-cta">
            <h3>Follow our socials</h3>
            <div className="social-icons">
              {/* Placeholders for social icons */}
              <div className="s-icon">FB</div>
              <div className="s-icon">IG</div>
              <div className="s-icon">TW</div>
              <div className="s-icon">LI</div>
            </div>
          </div>
        </motion.div>

        {/* Right: Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="contact-form-container"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="contact-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleChange}>
                      {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {formData.subject === 'business' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="form-group"
                  >
                    <label>GST Number (Optional)</label>
                    <input
                      type="text"
                      name="gst"
                      value={formData.gst}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                      className={errors.gst ? 'error' : ''}
                    />
                    {errors.gst && <span className="error-text">{errors.gst}</span>}
                  </motion.div>
                )}

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows="4"
                    className={errors.message ? 'error' : ''}
                  ></textarea>
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg submit-btn"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <Send size={18} className="ml-2" />}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="success-message"
              >
                <div className="success-icon-wrapper">
                  <CheckCircle size={64} />
                </div>
                <h2>Message Sent!</h2>
                <p>Thank you for reaching out. We've received your query and will get back to you shortly.</p>
                <button
                  className="btn btn-outline"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* FAQ Sneak Peek */}
      <section className="contact-faq">
        <div className="container">
          <div className="section-header center">
            <h2>Frequently Asked <span className="text-primary">Questions</span></h2>
            <p>Maybe your answer is just a click away.</p>
          </div>
          <div className="faq-mini-grid">
            <div className="faq-item">
              <h4>Shipping options?</h4>
              <p>We offer free standard shipping on all orders above ₹50,000.</p>
            </div>
            <div className="faq-item">
              <h4>Warranty policy?</h4>
              <p>All smartphones come with a minimum 1-year brand warranty.</p>
            </div>
            <div className="faq-item">
              <h4>Return process?</h4>
              <p>You can return any device within 7 days of delivery if defective.</p>
            </div>
          </div>
          <div className="center mt-8">
            <button className="btn btn-ghost">View All FAQs <ChevronRight size={18} /></button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
