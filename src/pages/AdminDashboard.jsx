export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Endpoints mapping:</p>
      <ul>
        <li>GET /admin/users</li>
      </ul>
      <p>
        <i>Test navigation to detail: <a href="/admin/users/123">User 123</a></i>
      </p>
    </div>
  )
}
