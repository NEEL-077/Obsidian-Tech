import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export const TextHoverEffect = ({ text }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ox = ((e.clientX - rect.left) / rect.width) * 100;
        const oy = ((e.clientY - rect.top) / rect.height) * 100;

        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
        e.currentTarget.style.setProperty('--x', `${Math.max(0, Math.min(100, ox))}%`);
        e.currentTarget.style.setProperty('--y', `${Math.max(0, Math.min(100, oy))}%`);
    };

    return (
        <div 
            onMouseMove={handleMouseMove}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default',
            }}
        >
            <svg width="100%" height="100%" viewBox="0 0 600 100">
                <defs>
                    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3ca2fa" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="48"
                    fontWeight="900"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
                >
                    {text}
                </text>
                <motion.text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="48"
                    fontWeight="900"
                    fill="url(#textGradient)"
                    stroke="none"
                    style={{ 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        maskImage: 'radial-gradient(circle at var(--x) var(--y), black 50px, transparent 100px)'
                    }}
                >
                    {text}
                </motion.text>
            </svg>
        </div>
    );
};

export const FooterBackgroundGradient = () => {
    return (
        <div 
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        >
            <div 
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 100%, rgba(60,162,250,0.15), transparent 70%)',
                }}
            />
        </div>
    );
};
