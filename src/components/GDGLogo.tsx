'use client';

/**
 * Logo for GDG Live Pakistan.
 * Add your logo as public/gdg-logo.png (or .svg) to replace the placeholder.
 */
export function GDGLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gdg-logo.png"
          alt="GDG Live Pakistan"
          className="h-full w-full object-contain p-1"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        {/* Fallback: minimal GDG-style badge when no image */}
        <div
          className="absolute inset-0 hidden items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white"
          style={{ display: 'none' }}
          aria-hidden
        >
          GDG
        </div>
      </div>
    </div>
  );
}
