export default function GameLobby() {
  return (
    <div>
      <h1>Game Lobby</h1>
      <p>Endpoints mapping:</p>
      <ul>
        <li>GET /games</li>
        <li>PUT api/games/{'{'}game{'}'}</li>
        <li>POST api/games/{'{'}game{'}'}/game</li>
        <li>DELETE api/games/{'{'}game{'}'}</li>
      </ul>
      <p>
        <i>Test navigation to room: <a href="/games/456">Game 456</a></i>
      </p>
    </div>
  )
}
