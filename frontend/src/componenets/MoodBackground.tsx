import { motion } from "framer-motion";

export default function MoodBackground({ text }: { text: string }) {
  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 bg-[#9EAA59]" />
      <motion.div
        key={text}
        className="absolute inset-0 flex items-center justify-center text-[120px] opacity-10 text-[#50350E]"
      >
        {text}
      </motion.div>
    </div>
  );
}