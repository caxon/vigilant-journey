# vigilant-journey
Game project for COMP 307 Final Project @McGill University

The game is a multiplayer platformer made using three.js for rendering and cannon.js for physics.

1. Group members
Chris Axon  (frontend)
Julia Luo   (frontend + backend) 
Muhang Li   (backend)

2. How to run:
Inside of the Backend307 folder, run the scripts below:

python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver

A redis server is also needed to run the project.

The server will be run on http://127.0.0.1:8000/

3. Required libraries:
To install the required packages, run:
pip install -r requirements.txt

The required libraries are:
Channels
channels-redis
redis
