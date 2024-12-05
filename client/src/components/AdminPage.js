import React, { useEffect, useState } from "react";

function AdminPage() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/reservations") // Chemin corrigé
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau");
        return response.json();
      })
      .then((data) => setReservations(data))
      .catch((error) => console.error("Erreur :", error));
  }, []);

  return (
    <div>
      <h1>Administration - Tableau des Réservations</h1>
      <table border="1" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Salle</th>
            <th>Email</th>
            <th>Début</th>
            <th>Fin</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.id}>
              <td>{res.id}</td>
              <td>{res.room_id}</td>
              <td>{res.email}</td>
              <td>{new Date(res.start_time).toLocaleString()}</td>
              <td>{new Date(res.end_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;
