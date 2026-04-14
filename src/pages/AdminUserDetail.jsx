import { useParams } from 'react-router-dom'

export default function AdminUserDetail() {
  const { id } = useParams()
  return (
    <div>
      <h1>Admin User Detail (ID: {id})</h1>
      <p>Endpoints mapping:</p>
      <ul>
        <li>GET /admin/users/{'{'}id{'}'}</li>
        <li>PUT api/admin/users/{'{'}id{'}'}</li>
        <li>PUT /admin/users/{'{'}id{'}'}/block</li>
        <li>DELETE api/admin/users/{'{'}id{'}'}</li>
      </ul>
    </div>
  )
}
