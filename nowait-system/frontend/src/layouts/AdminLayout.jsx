import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-shell px-4 py-4 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
}
