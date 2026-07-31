import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low px-5 py-6 pb-24 text-center text-xs text-on-surface-variant md:px-6 md:pb-6">
      <p>
        © {new Date().getFullYear()} Misas Mendoza ·{" "}
        <Link
          href="/legal"
          className="underline underline-offset-2 hover:text-primary"
        >
          Legal y privacidad
        </Link>
      </p>
    </footer>
  );
}
