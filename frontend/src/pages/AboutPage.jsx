import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Rocket, Users, ShieldCheck, Zap, TrendingUp, Award, Globe } from 'lucide-react';
import SEO from '../components/SEO';
import './AboutPage.css';

const AboutPage = () => {
  const stats = [
    { label: 'Happy Customers', value: '50k+', icon: <Users className="stat-icon" /> },
    { label: 'Smartphones Sold', value: '120k+', icon: <Zap className="stat-icon" /> },
    { label: 'Brands Available', value: '6+', icon: <Globe className="stat-icon" /> },
    { label: 'Quality Awards', value: '15', icon: <Award className="stat-icon" /> },
  ];

  const features = [
    {
      title: 'AI Recommendations',
      description: 'Our proprietary AI analyzes your needs to find the perfect smartphone for your lifestyle.',
      icon: <Zap />
    },
    {
      title: 'Trusted Platform',
      description: 'Every device undergoes a 50-point quality check to ensure peak performance.',
      icon: <ShieldCheck />
    },
    {
      title: 'Market Best Deals',
      description: 'We partner directly with brands to bring you prices that beat the competition.',
      icon: <TrendingUp />
    }
  ];

  return (
    <div className="about-page">
      <SEO
        title="About Us | OBSIDIAN TECH"
        description="Learn more about OBSIDIAN TECH - India's premier smartphone marketplace with AI-driven recommendations."
        url="/about"
      />

      {/* Hero Section */}
      <section className="about-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container"
        >
          <span className="badge">Our Story</span>
          <h1>Redefining the <span className="gradient-text">Smartphone Experience</span></h1>
          <p className="hero-subtitle">
            OBSIDIAN TECH is more than just a marketplace. We are a tech-first destination
            dedicated to helping you find your perfect digital companion using cutting-edge AI.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container grid">
          <motion.div
            whileHover={{ y: -10 }}
            className="about-card mission-card"
          >
            <div className="icon-wrapper"><Target /></div>
            <h2>Our Mission</h2>
            <p>To democratize access to high-end technology by providing a transparent, AI-powered platform that simplifies the smartphone buying journey for everyone.</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -10 }}
            className="about-card vision-card"
          >
            <div className="icon-wrapper"><Eye /></div>
            <h2>Our Vision</h2>
            <p>To become the world's most trusted smartphone ecosystem, where every purchase is backed by data, quality assurance, and unparalleled customer support.</p>
          </motion.div>
        </div>
      </section>

      {/* Company Story */}
      <section className="company-story">
        <div className="container split-layout">
          <div className="story-content">
            <span className="section-label">How it started</span>
            <h2>From a Simple Idea to a <span className="text-primary">Tech Revolution</span></h2>
            <p>Founded in 2022, OBSIDIAN TECH began in a small garage with a big dream: to end the confusion of buying a new phone. We noticed that consumers were overwhelmed by specs and marketing jargon.</p>
            <p>Our team of engineers and tech enthusiasts built an AI recommendation engine that matches users with devices based on actual utility, not just brand names. Today, we're proud to be India's fastest-growing mobile marketplace.</p>
          </div>
          <div className="story-image">
            <div className="abstract-shape"></div>
            <img
              src="/about_story_image_1775403900076.png"
              alt="Team collaborating"
              className="rounded-lg shadow-xl"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'; }}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="container stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="stat-item"
            >
              {stat.icon}
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="about-features">
        <div className="container">
          <div className="section-header center">
            <h2>Why Choose <span className="gradient-text">OBSIDIAN TECH?</span></h2>
            <p>We combine technology with trust to deliver a premium shopping experience.</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="cta-wrapper"
          >
            <h2>Ready to find your next phone?</h2>
            <p>Join thousands of happy customers who found their perfect match.</p>
            <button className="btn btn-primary btn-lg" onClick={() => window.location.href = '/products'}>
              Explore Smartpohones <Rocket size={20} className="ml-2" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
