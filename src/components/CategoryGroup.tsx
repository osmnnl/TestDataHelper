import type { ReactNode } from "react";
import "./CategoryGroup.css";

interface CategoryGroupProps {
  title: string;
  icon: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CategoryGroup({
  title,
  icon,
  children,
  defaultOpen = true,
}: CategoryGroupProps) {
  return (
    <div className="category-group">
      <div className="category-header">
        <span className="category-icon">{icon}</span>
        <span className="category-title">{title}</span>
      </div>
      {defaultOpen && <div className="category-content">{children}</div>}
    </div>
  );
}
