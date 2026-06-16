import { createFileRoute, Outlet } from "@tanstack/react-router";

// Pure layout for everything under /admin/*. The actual dashboard lives in
// admin.index.tsx and the login in admin.login.tsx. Without this file,
// admin.index.tsx would still work, but having an explicit empty layout
// makes the parent/child relationship clear.
export const Route = createFileRoute("/admin")({
  component: () => <Outlet />,
});
