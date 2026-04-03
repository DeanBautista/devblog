import { Github, Linkedin } from 'lucide-react';

const FOOTER_SOCIAL_LINKS = [
  { label: 'GITHUB', href: 'https://github.com/DeanBautista', Icon: Github },
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/dean-paolo-bautista-6145083ba/', Icon: Linkedin },
];

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-outline-variant/35 bg-surface-container-low/35">
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-primary/12 via-transparent to-primary/8"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 py-8 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface">
            Obsidian Architect
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">
            © {currentYear} Obsidian Architect. Built with Tonal Precision.
          </p>
        </div>

        <nav
          aria-label="Footer social links"
          className="flex items-center justify-center gap-2.5 sm:justify-end"
        >
          {FOOTER_SOCIAL_LINKS.map((socialLink) => (
            <a
              key={socialLink.label}
              href={socialLink.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface px-3.5 py-2 text-[11px] font-semibold tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/45 hover:text-on-surface"
            >
              <socialLink.Icon size={14} aria-hidden="true" />
              <span>{socialLink.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}