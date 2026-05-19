import React from 'react';
import { motion } from 'framer-motion';

export function TimelineContent({
  as = 'div',
  animationNum = 0,
  timelineRef,
  customVariants,
  children,
  className,
  ...props
}) {
  const Component = typeof as === 'string' ? motion[as] : motion(as);
  
  const variants = customVariants || {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <Component
      className={className}
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ root: timelineRef, once: true, margin: "-50px" }}
      variants={variants}
      {...props}
    >
      {children}
    </Component>
  );
}
