import React from 'react';
import SEO from '../components/SEO';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <SEO title="About Us | OBSIDIAN TECH" />

      <section className="about-hero">
        <h1>Designed to be <br/>different.</h1>
        <p>
          OBSIDIAN TECH is more than just a marketplace. We are a tech-first destination
          dedicated to helping you find your perfect digital companion.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>To democratize access to high-end technology by providing a transparent, AI-powered platform that simplifies the smartphone buying journey for everyone.</p>
        <p>We combine technology with trust to deliver a premium shopping experience, partnering directly with top brands to ensure quality and authenticity.</p>
      </section>

      <div className="about-values">
        <div className="value-card">
          <div className="value-icon">🤖</div>
          <h3>AI Recommendations</h3>
          <p>Our proprietary AI analyzes your needs to find the perfect smartphone.</p>
        </div>
        <div className="value-card">
          <div className="value-icon">🛡️</div>
          <h3>Trusted Platform</h3>
          <p>Every device undergoes rigorous checks to ensure peak performance.</p>
        </div>
        <div className="value-card">
          <div className="value-icon">✨</div>
          <h3>Premium Quality</h3>
          <p>We partner directly with brands to bring you genuine devices.</p>
        </div>
      </div>

      <section className="about-section" style={{ textAlign: 'center', paddingBottom: '100px' }}>
        <h2>Ready to find your next phone?</h2>
        <a href="/products" style={{ display: 'inline-block', marginTop: '16px', color: '#2997ff', textDecoration: 'none', fontWeight: '600' }}>Explore our collection →</a>
      </section>
    </div>
  );
};

export default AboutPage;
