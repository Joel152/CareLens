const VARIANTS = {
  primary:
    'bg-accent text-white hover:bg-ink-700 border border-transparent',

  secondary:
    'bg-white text-ink border border-slate-line hover:bg-slate-soft',

  quiet:
    'bg-transparent text-slate-muted border border-transparent hover:bg-slate-soft hover:text-ink',
};

const SIZES = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
};

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const extra =
    Tag === 'button'
      ? {
          type: props.type ?? 'button',
        }
      : {};

  return (
    <Tag
      {...extra}
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        VARIANTS[variant]
      } ${SIZES[size]} ${className}`}
    >
      {children}
    </Tag>
  );
}