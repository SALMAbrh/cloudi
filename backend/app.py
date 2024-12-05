from flask import Flask, jsonify, request, url_for, redirect, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from authlib.integrations.flask_client import OAuth
import os

app = Flask(__name__)
CORS(app)



# Configuration de la base de données
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reservations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)



# Modèle pour les réservations
class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# Endpoint pour récupérer toutes les réservations
@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    reservations = Reservation.query.all()
    return jsonify([{
        'id': r.id,
        'room_id': r.room_id,
        'email': r.email,
        'start_time': r.start_time.isoformat(),
        'end_time': r.end_time.isoformat()
    } for r in reservations])

# Endpoint pour ajouter une nouvelle réservation
@app.route('/api/reservations', methods=['POST'])
def add_reservation():
    data = request.json
    room_id = data.get('room_id')
    email = data.get('email')
    start_time = datetime.fromisoformat(data.get('start_time'))
    end_time = datetime.fromisoformat(data.get('end_time'))

    new_reservation = Reservation(
        room_id=room_id,
        email=email,
        start_time=start_time,
        end_time=end_time
    )
    db.session.add(new_reservation)
    db.session.commit()

    # Envoyer un email de confirmation
    send_confirmation_email(email, room_id, start_time, end_time)

    return jsonify({
        'id': new_reservation.id,
        'room_id': new_reservation.room_id,
        'email': new_reservation.email,
        'start_time': new_reservation.start_time.isoformat(),
        'end_time': new_reservation.end_time.isoformat()
    }), 201

# Fonction pour envoyer un email de confirmation
def send_confirmation_email(email, room_id, start_time, end_time):
    message = Mail(
        from_email='reservationdesalleesi@gmail.com',
        to_emails=email,
        subject='Confirmation de réservation',
        html_content=f"""
        <strong>Bonjour,</strong><br>
        Votre réservation a été confirmée.<br>
        <ul>
            <li><strong>Salle : </strong>{room_id}</li>
            <li><strong>Début : </strong>{start_time}</li>
            <li><strong>Fin : </strong>{end_time}</li>
        </ul>
        """
    )
    try:
        sg = SendGridAPIClient("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")
        response = sg.send(message)
        print(f"Email envoyé avec succès : {response.status_code}")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email : {e}")

# Initialisation manuelle de la base de données
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
