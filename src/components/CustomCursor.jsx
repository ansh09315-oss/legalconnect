import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (
        e.target.tagName === 'A' ||
        e.target.tagName === 'BUTTON' ||
        e.target.closest('a') ||
        e.target.closest('button') ||
        e.target.getAttribute('role') === 'button' ||
        e.target.closest('.interactive')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
      height: 20,
      width: 20,
      backgroundColor: 'rgba(0, 229, 255, 0.4)',
      boxShadow: '0 0 10px rgba(0, 229, 255, 0.8)',
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 400,
        mass: 0.1
      }
    },
    hover: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 48,
      width: 48,
      backgroundColor: 'rgba(0, 229, 255, 0.1)',
      border: '1px solid rgba(0, 229, 255, 0.8)',
      boxShadow: '0 0 20px rgba(0, 229, 255, 0.6)',
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        mass: 0.1
      }
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999]"
      variants={variants}
      animate={isHovering ? "hover" : "default"}
      initial="default"
    />
  );
};

export default CustomCursor;
