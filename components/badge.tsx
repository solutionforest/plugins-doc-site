import { cn } from "@/lib/utils";

export type BadgeColor =
  | 'primary'
  | 'gray'
  | 'red'
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'amber'
  | 'teal'
  | 'cyan'
  | 'pink'
  | 'indigo'
  | 'rose'
  | 'emerald'
  | 'sky'
  | 'violet'
  | 'lime'
  | 'fuchsia';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: BadgeColor;
};

const badgeColorClass: Record<BadgeColor, string> = {
  primary: "bg-primary/10 text-primary text-sm border-primary/20",
  gray: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  green: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  lime: "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20",
  fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
};

export const Badge: React.FC<BadgeProps> = ({ children, className, size = 'md', color = 'primary' }) => {
  return (
    <span className={cn(
      "rounded-full",
      "border",
      size === 'sm' && "px-1 py-0.5 text-xs",
      size === 'md' && "px-2 py-1 text-xs",
      size === 'lg' && "px-3 py-1 text-sm",
      badgeColorClass[color] ?? badgeColorClass.gray,
      className,
    )}>
      {children}
    </span>
  );
}
