import UserManagement from '../components/admin/UserManagement';
import { DashboardPage } from '../components/dashboard/DashboardUI';

export default function TeamManagementPage() {
  return (
    <DashboardPage>
      <UserManagement />
    </DashboardPage>
  );
}
