import { ReactNode } from "react";

export const Sidebar = ({ children }: { children: ReactNode }) => {
  return (
    <aside className="block w-60 h-screen border-r-2 border-neutral-800 pt-1">
      {children}
    </aside>
  );
};

export default Sidebar;
