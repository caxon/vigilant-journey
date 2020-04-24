# vigilant-journey
Game project for COMP 307 Final Project @McGill University

[Google Docs brainstorming link](https://docs.google.com/document/d/1rU5rRi-6WzpFxLRZ0opM5Ilrex-4PVdGKpuR3UfgnzY/edit?usp=sharing)


How to run: 

requires the following modules in the /includes folder:

vigilant-journey\include  
  \ cannon-es  
    \ cannon.js  
  \ stats  
    \ stats.module.js  
  \ three  
    \ built  
      \ three.module.js  
    \ examples  
      \ jsm  
        \ FirstPersonControls.js  
        \ OrbitControls.js  
        \ PointerLockControls.js  
        \ TrackballControls.js  


How to run backend:
Go to Backend307 folder, then use terminal and run `python mangage.py runserver`.
The server will be run on http://127.0.0.1:8000/


You can now just run `python mangage.py runserver` in `Backend307` folder to start the game.


How to Set-Up (cd to Backend307 folder), then run:
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py rumserver

In a separate terminal, run:
./redis-server