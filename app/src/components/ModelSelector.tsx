import { Crown, Zap, PiggyBank } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ModelOption } from '@/types';

const models: ModelOption[] = [
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    description: 'Most intelligent, premium quality',
    icon: 'crown',
    iconColor: '#e74c3c',
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    description: 'Best balance of speed & quality',
    icon: 'zap',
    iconColor: '#f39c12',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini 2.5 Flash',
    description: 'Fastest & most economical',
    icon: 'piggy-bank',
    iconColor: '#2ecc71',
  },
];

function ModelIcon({ type, color }: { type: ModelOption['icon']; color: string }) {
  const props = { className: 'h-4 w-4', style: { color } };
  switch (type) {
    case 'crown':
      return <Crown {...props} />;
    case 'zap':
      return <Zap {...props} />;
    case 'piggy-bank':
      return <PiggyBank {...props} />;
  }
}

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const selectedModel = models.find((m) => m.id === value);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Model
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-secondary/50 border-border focus:border-primary focus:ring-primary/20">
          <SelectValue>
            {selectedModel && (
              <div className="flex items-center gap-2">
                <ModelIcon type={selectedModel.icon} color={selectedModel.iconColor} />
                <span>{selectedModel.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {models.map((model) => (
            <SelectItem
              key={model.id}
              value={model.id}
              className="focus:bg-primary/10 focus:text-foreground"
            >
              <div className="flex items-center gap-3 py-1">
                <ModelIcon type={model.icon} color={model.iconColor} />
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
