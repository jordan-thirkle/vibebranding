import Field from "@/components/Field";

interface ProductInput {
  name: string;
  description: string;
  category: string;
  audience: string;
  competitors: string;
}

interface ProductFormProps {
  input: ProductInput;
  onChange: (v: ProductInput) => void;
  onSubmit: () => void;
  error: string;
}

export default function ProductForm({ input, onChange, onSubmit, error }: ProductFormProps) {
  return (
    <div className="vb-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Create Your Brand Identity</h2>
        <p className="text-zinc-500 mt-1">Describe your product and VibeBranding will generate a complete brand system — strategy, naming, colours, typography, voice, and launch assets.</p>
      </div>

      <div className="space-y-5">
        <Field label="Product Name" hint="What's your product called? (can be a working title)">
          <input
            type="text"
            value={input.name}
            onChange={(e) => onChange({ ...input, name: e.target.value })}
            placeholder="e.g., PixelForge, Draftly, FlowKit"
            aria-describedby="field-product-name-hint"
            aria-required="true"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Field>

        <Field label="Description" hint="What does it do? Be specific.">
          <textarea
            value={input.description}
            onChange={(e) => onChange({ ...input, description: e.target.value })}
            placeholder="e.g., An AI-powered design tool that transforms rough sketches into production-ready UI components..."
            rows={4}
            aria-describedby="field-description-hint"
            aria-required="true"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </Field>

        <Field label="Category" hint="What kind of product is this?">
          <select
            value={input.category}
            onChange={(e) => onChange({ ...input, category: e.target.value })}
            aria-describedby="field-category-hint"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>SaaS</option>
            <option>Developer Tool</option>
            <option>Consumer App</option>
            <option>Creative Tool</option>
            <option>Marketplace</option>
            <option>AI / ML Product</option>
            <option>API Service</option>
            <option>Mobile App</option>
            <option>Game</option>
          </select>
        </Field>

        <Field label="Target Audience" hint="Who will use this? Demographics, role, tech level.">
          <input
            type="text"
            value={input.audience}
            onChange={(e) => onChange({ ...input, audience: e.target.value })}
            placeholder="e.g., UI/UX designers and frontend devs, age 22-40"
            aria-describedby="field-target-audience-hint"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Field>

        <Field label="Competitors" hint="Comma-separated list (optional)">
          <input
            type="text"
            value={input.competitors}
            onChange={(e) => onChange({ ...input, competitors: e.target.value })}
            placeholder="e.g., Figma, Canva, Galileo AI"
            aria-describedby="field-competitors-hint"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Field>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
          {error.includes("429") && (
            <p className="mt-1 text-xs text-red-500">
              Gemini API quota exceeded. Free tier allows ~20 requests/day. Your brand will work once quota resets.
            </p>
          )}
          {error.includes("Network") && (
            <p className="mt-1 text-xs text-red-500">
              Check your internet connection and try again.
            </p>
          )}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!input.name || !input.description}
        className="mt-6 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
      >
        Generate Brand Identity →
      </button>

      <p className="mt-3 text-xs text-zinc-500 text-center">
        Powered by Gemini 3.5 Flash • Stages 1-8 run automatically
      </p>
    </div>
  );
}
