import { useParams } from 'react-router-dom'

export default function GameRoom() {
  const { id } = useParams()
  return (
    <div>
      <h1>Game Room (ID: {id})</h1>
      <p>Endpoints mapping:</p>
      <ul>
        <li>GET /games/{'{'}id{'}'}</li>
        <li>PUT /game/actions</li>
      </ul>
    </div>
  )
}
