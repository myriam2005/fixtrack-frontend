import "./App.css";
import { users, machines, tickets } from "./mockData";

function App() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>FixTrack — Official JSON Format</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        This page is only for verifying the data contract (frontend/backend).
      </p>

      <section style={{ marginTop: 24 }}>
        <h2>User</h2>
        <p style={{ opacity: 0.8 }}>
          Keys: <b>id</b>, <b>nom</b>, <b>email</b>, <b>role</b>, <b>avatar</b>
        </p>
        <pre style={preStyle}>{JSON.stringify(users[0], null, 2)}</pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Machine</h2>
        <p style={{ opacity: 0.8 }}>
          Keys: <b>id</b>, <b>nom</b>, <b>localisation</b>, <b>categorie</b>,{" "}
          <b>statut</b>
        </p>
        <pre style={preStyle}>{JSON.stringify(machines[0], null, 2)}</pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Ticket</h2>
        <p style={{ opacity: 0.8 }}>
          Keys: <b>id</b>, <b>titre</b>, <b>description</b>, <b>statut</b>,{" "}
          <b>priorite</b>, <b>machineId</b>, <b>auteurId</b>,{" "}
          <b>technicienId</b>, <b>dateCreation</b>, <b>notes</b>
        </p>
        <pre style={preStyle}>{JSON.stringify(tickets[0], null, 2)}</pre>

        <div style={{ marginTop: 12, opacity: 0.85 }}>
          <p style={{ marginBottom: 6 }}>
            <b>Relationships:</b>
          </p>
          <ul style={{ marginTop: 0 }}>
            <li>
              ticket.machineId → machine.id : <b>{tickets[0].machineId}</b> →{" "}
              <b>{machines[0].id}</b>
            </li>
            <li>
              ticket.auteurId → user.id : <b>{tickets[0].auteurId}</b> →{" "}
              <b>{users[0].id}</b>
            </li>
            <li>
              ticket.technicienId can be <b>null</b> (not assigned yet)
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

const preStyle = {
  background: "#111",
  color: "#eee",
  padding: 14,
  borderRadius: 10,
  overflowX: "auto",
  border: "1px solid #333",
};

export default App;
