import React, { useState } from 'react';
import SEO from '../components/SEO';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <SEO title="Contact Us | OBSIDIAN TECH" />

      <div className="contact-hero">
        <h1>Get in touch.</h1>
        <p>We'd love to hear from you. Our team is always here to help.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="contact-info-card">
            <div className="contact-info-icon">✉️</div>
            <h3>Email Us</h3>
            <a href="mailto:support@obsidiantech.com">support@obsidiantech.com</a>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon">📞</div>
            <h3>Call Us</h3>
            <a href="tel:+911234567890">+91 123 456 7890</a>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon">🏢</div>
            <h3>Visit Us</h3>
            <p>Surat, Gujarat, India</p>
          </div>
        </div>

        <div className="contact-form-wrap">
          <h2>Send us a message</h2>
          <form onSubmit={handleSubmit}>
            <div className="contact-field">
              <label className="contact-label">Name</label>
              <input 
                type="text" 
                className="contact-input" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div className="contact-field">
              <label className="contact-label">Email</label>
              <input 
                type="email" 
                className="contact-input" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            <div className="contact-field">
              <label className="contact-label">Message</label>
              <textarea 
                className="contact-textarea" 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                required 
              ></textarea>
            </div>
            <button type="submit" className="contact-submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
