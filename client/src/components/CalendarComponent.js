import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const CLIENT_ID = "100174910445-i34qd8f9l36pipfd4cce62jhm1u3be8h.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar";

function CalendarComponent() {
  const [events, setEvents] = useState([]); // Événements affichés
  const [error, setError] = useState(null); // Gestion des erreurs
  const [token, setToken] = useState(null); // Token Google
  const [selectedRoom, setSelectedRoom] = useState(""); // Salle sélectionnée
  const [availableTimes, setAvailableTimes] = useState([]); // Horaires disponibles
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    email: "",
  });

  const rooms = [
    { id: "room10", name: "Salle 10", times: ["09:00", "10:00", "11:00"] },
    { id: "room20", name: "Salle 20", times: ["12:00", "13:00", "14:00"] },
  ];

  // Récupérer les réservations depuis Flask
  useEffect(() => {
    fetch("http://localhost:5000/api/reservations")
      .then((response) => response.json())
      .then((data) => {
        const formattedEvents = data.map((event) => ({
          title: `Salle ${event.room_id} - Réservé par ${event.email}`,
          start: event.start_time,
          end: event.end_time,
        }));
        setEvents((prevEvents) => {
          const uniqueEvents = [...prevEvents];
          formattedEvents.forEach((newEvent) => {
            if (
              !uniqueEvents.some(
                (e) => e.start === newEvent.start && e.title === newEvent.title
              )
            ) {
              uniqueEvents.push(newEvent);
            }
          });
          return uniqueEvents;
        });
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des réservations depuis Flask :", error);
      });
  }, []);

  useEffect(() => {
    const initializeGIS = () => {
      /* eslint-disable no-undef */
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            setToken(response.access_token);
          } else {
            setError("Erreur lors de l'obtention du token Google.");
          }
        },
      });

      tokenClient.requestAccessToken();
    };

    const checkGoogleLoaded = () => {
      if (typeof google === "undefined") {
        setTimeout(checkGoogleLoaded, 100);
      } else {
        initializeGIS();
      }
    };

    checkGoogleLoaded();
  }, []);

  // Ajouter une réservation à Flask
  const addReservationToFlask = (reservation) => {
    fetch("http://localhost:5000/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservation),
    })
      .then((response) => response.json())
      .then((data) => {
        // Ajouter la réservation localement
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            title: `Salle ${data.room_id} - Réservé par ${data.email}`,
            start: data.start_time,
            end: data.end_time,
          },
        ]);
        // Afficher un message de succès
        alert(`Confirmation envoyée par e-mail à ${data.email}`);
      })
      .catch((error) => console.error("Erreur lors de l'ajout de la réservation dans Flask :", error));
  };

  const handleRoomChange = (e) => {
    const room = rooms.find((r) => r.id === e.target.value);
    setSelectedRoom(room.id);
    setAvailableTimes(room.times);
  };

  const handleReservation = (e) => {
    e.preventDefault();

    if (!token) {
      setError("Vous devez être connecté pour ajouter une réservation.");
      return;
    }

    const newReservation = {
      room_id: selectedRoom,
      email: formData.email,
      start_time: `${formData.date}T${formData.time}`,
      end_time: `${formData.date}T${parseInt(formData.time.split(":")[0]) + 1}:00:00`,
    };

    // Ajouter dans Flask (et envoyer l'email automatiquement via Flask)
    addReservationToFlask(newReservation);

    // Réinitialiser le formulaire
    setFormData({ date: "", time: "", email: "" });
  };

  return (
    <div>
      <h1>Réservations de salles</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleReservation}>
        <label>Salle : </label>
        <select onChange={handleRoomChange} value={selectedRoom} required>
          <option value="" disabled>
            Sélectionnez une salle
          </option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <label>Date : </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <label>Heure : </label>
        <select
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        >
          <option value="" disabled>
            Sélectionnez une heure
          </option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <label>Email : </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <button type="submit">Réserver</button>
      </form>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
      />
    </div>
  );
}

export default CalendarComponent;
