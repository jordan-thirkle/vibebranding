interface CardProps {
  title: string;
  colour: string;
  children: React.ReactNode;
}

export default function Card({ title, colour, children }: CardProps) {
  return (
    <div className={`border-l-4 ${colour} rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm`}>
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}
