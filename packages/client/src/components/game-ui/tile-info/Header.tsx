import { motion } from "framer-motion";

const Header = ({ content }: { content: string }) => {
  return (
    <motion.div layout className="bg-gray-900 mx-1">
      <p>{content}</p>
    </motion.div>
  );
};

export default Header;
