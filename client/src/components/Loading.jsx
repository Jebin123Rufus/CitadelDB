export default function Loading({ text = 'Loading intelligence data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
      <div className="w-10 h-10 border-2 border-citadel-accent/30 border-t-citadel-accent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm font-sans">{text}</p>
    </div>
  );
}
