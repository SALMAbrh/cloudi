import os

# Génère une clé secrète de 24 octets et la convertit en une chaîne hexadécimale
secret_key = os.urandom(24).hex()

# Affiche la clé secrète générée
print(secret_key)