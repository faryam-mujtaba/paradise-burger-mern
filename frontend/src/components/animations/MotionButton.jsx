import { motion } from "framer-motion";

function MotionButton({ children, className, type = "button", onClick, disabled }) {
  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  );
}

export default MotionButton;