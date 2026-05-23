import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./hero-section.css";
import { TimelineContent } from "./timeline-animation";

export default function HeroSection() {
  const timelineRef = useRef(null);
  const [heroUrls, setHeroUrls] = useState({
    iphone: '/products',
    galaxy: '/products',
    pixel: '/products'
  });

  useEffect(() => {
    const fetchHeroIds = async () => {
      try {
        const res = await fetch('/api/products?pageSize=50');
        const data = await res.json();
        const products = data.products || [];
        
        const iphone = products.find(p => p.name.includes('iPhone 17 Pro'));
        const galaxy = products.find(p => p.name.includes('Galaxy S26'));
        const pixel = products.find(p => p.name.includes('Pixel 10'));

        setHeroUrls({
          iphone: iphone ? `/product/${iphone._id}` : '/products',
          galaxy: galaxy ? `/product/${galaxy._id}` : '/products',
          pixel: pixel ? `/product/${pixel._id}` : '/products'
        });
      } catch (e) {
        console.error('Failed to fetch hero products', e);
      }
    };
    fetchHeroIds();
  }, []);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.12, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
    hidden: { filter: "blur(12px)", y: 30, opacity: 0 },
  };

  return (
    <main className="apple-homepage" ref={timelineRef}>

      {/* ── UNIT 1: iPhone 16 Pro Max (Dark) ───────────────────────── */}
      <section className="hero-unit dark">
        <div className="hero-content">
          <TimelineContent
            as="h2"
            animationNum={1}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-headline"
          >
            iPhone 17 Pro Max
          </TimelineContent>

          <TimelineContent
            as="h3"
            animationNum={2}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-subheadline"
          >
            Hello, Apple Intelligence.
          </TimelineContent>

          <TimelineContent
            as="div"
            animationNum={3}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-links"
          >
            <Link to={heroUrls.iphone} className="apple-btn-primary">Learn more</Link>
            <Link to={heroUrls.iphone} className="apple-btn-secondary">Buy</Link>
          </TimelineContent>
        </div>

        <TimelineContent
          as="div"
          animationNum={4}
          timelineRef={timelineRef}
          customVariants={revealVariants}
          className="hero-image-wrapper"
        >
          <img src="/images/heroes/i17pm.png" alt="iPhone 17 Pro Max" className="hero-image" />
        </TimelineContent>
      </section>


      {/* ── UNIT 2: Galaxy S25 Ultra (Light) ───────────────────────── */}
      <section className="hero-unit light">
        <div className="hero-content">
          <TimelineContent
            as="h2"
            animationNum={5}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-headline"
          >
            Galaxy S26 Ultra
          </TimelineContent>

          <TimelineContent
            as="h3"
            animationNum={6}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-subheadline"
          >
            Galaxy AI is here.
          </TimelineContent>

          <TimelineContent
            as="div"
            animationNum={7}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-links"
          >
            <Link to={heroUrls.galaxy} className="apple-btn-primary">Learn more</Link>
            <Link to={heroUrls.galaxy} className="apple-btn-secondary">Buy</Link>
          </TimelineContent>
        </div>

        <TimelineContent
          as="div"
          animationNum={8}
          timelineRef={timelineRef}
          customVariants={revealVariants}
          className="hero-image-wrapper"
        >
          <img src="/images/heroes/sm26ultra.png" alt="Galaxy S25 Ultra" className="hero-image" />
        </TimelineContent>
      </section>


      {/* ── UNIT 3: Pixel 10 Pro (Dark) ─────────────────────────────── */}
      <section className="hero-unit dark">
        <div className="hero-content">
          <TimelineContent
            as="h2"
            animationNum={9}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-headline"
          >
            Pixel 10 Fold
          </TimelineContent>

          <TimelineContent
            as="h3"
            animationNum={10}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-subheadline"
          >
            The magic of Gemini.
          </TimelineContent>

          <TimelineContent
            as="div"
            animationNum={11}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="hero-links"
          >
            <Link to={heroUrls.pixel} className="apple-btn-primary">Learn more</Link>
            <Link to={heroUrls.pixel} className="apple-btn-secondary">Buy</Link>
          </TimelineContent>
        </div>

        <TimelineContent
          as="div"
          animationNum={12}
          timelineRef={timelineRef}
          customVariants={revealVariants}
          className="hero-image-wrapper"
        >
          <img src="/images/heroes/p10f.png" alt="Pixel 10 Fold" className="hero-image" />
        </TimelineContent>
      </section>

      {/* ── BENTO GRID ─────────────────────────────────────────────── */}
      <section className="bento-grid">

        {/* Bento 1: OnePlus 15 */}
        <div className="bento-item light">
          <div className="bento-content">
            <h4 className="bento-headline">OnePlus 15</h4>
            <p className="bento-subheadline">Smooth beyond belief.</p>
            <div className="hero-links">
              <Link to="/product/b82a3b04-a90b-48c9-8d7b-99d985db6e04" className="apple-btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Learn more</Link>
            </div>
          </div>
          <div className="bento-image-wrapper">
            <img src="/images/heroes/op15.png" alt="OnePlus 15" className="bento-image" style={{ transform: 'scale(1.2)' }} />
          </div>
        </div>

        {/* Bento 2: Xiaomi 17 Ultra */}
        <div className="bento-item dark">
          <div className="bento-content">
            <h4 className="bento-headline">Xiaomi 17 Ultra</h4>
            <p className="bento-subheadline">Photography redefined.</p>
            <div className="hero-links">
              <Link to="/product/b82a3b04-a90b-48c9-8d7b-99d985db6e05" className="apple-btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Learn more</Link>
            </div>
          </div>
          <div className="bento-image-wrapper">
            <img src="/images/heroes/x17u.png" alt="Xiaomi 17 Ultra" className="bento-image" style={{ transform: 'scale(1.2)' }} />
          </div>
        </div>

        {/* Bento 3: Categories / Accessories */}
        <div className="bento-item light">
          <div className="bento-content">
            <h4 className="bento-headline">Accessories</h4>
            <p className="bento-subheadline">Magic runs in the family.</p>
            <div className="hero-links">
              <Link to="/category/earpiece" className="apple-btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Shop Accessories</Link>
            </div>
          </div>
          <div className="bento-image-wrapper" style={{ height: '60%' }}>
            {/* Using an SVG placeholder for accessories if no image exists */}
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
          </div>
        </div>

        {/* Bento 4: Support / Trade-in */}
        <div className="bento-item light">
          <div className="bento-content">
            <h4 className="bento-headline">Trade In</h4>
            <p className="bento-subheadline">Get credit toward a new device.</p>
            <div className="hero-links">
              <Link to="/contact" className="apple-btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>See what your device is worth</Link>
            </div>
          </div>
          <div className="bento-image-wrapper" style={{ height: '60%' }}>
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#2997ff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><path d="m16 4 3 3-3 3"></path><path d="M19 7H9"></path></svg>
          </div>
        </div>

      </section>

      {/* ── LEGAL / FOOTER TEXT ──────────────────────────────────────── */}
      <section className="apple-legal-text" style={{
        fontSize: '0.6875rem',
        color: '#86868b',
        padding: '40px 22px 60px',
        maxWidth: '980px',
        margin: '40px auto 0',
        lineHeight: '1.4',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <p>1. Trade-in values will vary based on the condition, year, and configuration of your eligible trade-in device. Not all devices are eligible for credit. You must be at least 18 years old to be eligible to trade in for credit or for an Obsidian Gift Card. Trade-in value may be applied toward qualifying new device purchase, or added to an Obsidian Gift Card. Actual value awarded is based on receipt of a qualifying device matching the description provided when estimate was made. Sales tax may be assessed on full value of a new device purchase. In-store trade-in requires presentation of a valid photo ID (local law may require saving this information). Offer may not be available in all stores, and may vary between in-store and online trade-in.</p>

        <p style={{ marginTop: '12px' }}>2. Apple Intelligence is available in beta on all iPhone 16 models, iPhone 15 Pro, and iPhone 15 Pro Max, with Siri and device language set to U.S. English, as part of an iOS 26 update. Some features, additional languages, and platforms will be coming over the course of the next year.</p>

        <p style={{ marginTop: '12px' }}>3. Galaxy AI features by Samsung will be provided for free until the end of 2027 on supported Samsung Galaxy devices. The use of some AI features provided by third parties may require a subscription and/or account creation.</p>

        <p style={{ marginTop: '12px' }}>4. Available space is less and varies due to many factors. A standard configuration uses approximately 12GB to 17GB of space, including iOS 26 with its latest features and Apple apps that can be deleted. Apple apps that can be deleted use about 4.5GB of space, and you can download them back from the App Store. Storage capacity subject to change based on software version, settings, and iPhone model.</p>

        <p style={{ marginTop: '12px' }}>To access and use all the features of your new device, you must connect to the internet. Cellular data charges may apply.</p>

        <p style={{ marginTop: '12px' }}>Some features may not be available for all countries or all areas. Features are subject to change. Some features, applications, and services may not be available in all regions or all languages.</p>
      </section>
    </main>
  );
}
