import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'gray' | 'red' | 'green' | 'blue' | 'purple' | 'orange' | 'amber';
};

export const Badge: React.FC<BadgeProps> = ({ children, className, size = 'md', color = 'primary' }) => {
  return (
    <span className={cn(
      "rounded-full",
      "border",
      size === 'sm' && "px-1 py-0.5 text-xs",
      size === 'md' && "px-2 py-1 text-xs",
      size === 'lg' && `px-3 py-1 text-sm`,
      color === 'primary' &&  `bg-primary/10 text-primary text-sm border-primary/20`,
      color === 'green' && `bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20`,
      color === 'purple' && `bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20`,
      color === 'orange' && `bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20`,
      color === 'red' && `bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20`,
      color === 'blue' && `bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`,
      color === 'amber' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      color === 'gray' || !color ? `bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20` : '',
      className,
    )}>
      {children}
    </span>
  );
}