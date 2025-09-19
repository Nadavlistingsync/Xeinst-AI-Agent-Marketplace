"use client";

import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface MotionWrapperProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  className?: string;
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({ 
  children, 
  className, 
  ...motionProps 
}) => {
  return (
    <motion.div
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
