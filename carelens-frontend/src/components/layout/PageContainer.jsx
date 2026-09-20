const WIDTHS = { narrow: 'max-w-2xl', default: 'max-w-4xl', wide: 'max-w-6xl' };

export default function PageContainer({ width = 'default', children }) {
  return <div className={`mx-auto w-full px-5 py-8 sm:px-8 ${WIDTHS[width]}`}>{children}</div>;
}
