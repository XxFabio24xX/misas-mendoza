import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb"
         className="mb-6 flex items-center gap-1.5 text-sm">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <ChevronRight className="h-3.5 w-3.5
              shrink-0 text-on-surface-variant/50" />
          )}
          {item.href ? (
            <Link href={item.href}
              className="text-on-surface-variant
                         hover:text-on-surface transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-on-surface font-medium">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
