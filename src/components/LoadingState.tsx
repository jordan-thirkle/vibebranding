interface Stage {
  num: number;
  label: string;
  icon: string;
}

interface LoadingStateProps {
  currentStage: number;
  stages: Stage[];
}

const stageMessages: Record<number, string> = {
  1: "Analyzing product positioning and market landscape...",
  2: "Identifying brand archetypes and emotional territory...",
  3: "Generating and scoring name candidates...",
  4: "Crafting colour palette and typography system...",
  5: "Designing logo concepts and visual identity...",
  6: "Developing brand voice and messaging hierarchy...",
  7: "Creating application and asset specifications...",
  8: "Compiling brand guidelines document...",
  9: "Running consistency checks and preparing export...",
};

export default function LoadingState({ currentStage, stages }: LoadingStateProps) {
  const stage = stages[currentStage - 1];
  return (
    <div className="flex flex-col items-center justify-center py-20 vb-fade-in" role="status" aria-label="Generating brand identity">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full vb-spin mb-6" />
      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-500">
        Running {stage?.label || "brand pipeline"}...
      </p>
      <p className="text-sm text-zinc-500 mt-2 max-w-md text-center">
        {stageMessages[currentStage] || "Processing your brand identity..."}
      </p>
      <div className="mt-6 flex gap-1.5">
        {stages.slice(0, currentStage - 1).map((s) => (
          <span key={s.num} className="w-2 h-2 rounded-full bg-blue-400" />
        ))}
        <span className="w-2 h-2 rounded-full bg-blue-600 vb-pulse-slow" />
        {stages.slice(currentStage).map((s) => (
          <span key={s.num} className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        ))}
      </div>
    </div>
  );
}
