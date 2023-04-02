# Duke Ignite: Duke Dining Calorie Tracker
By: Josh Chen, Bryant Chung, Dylan Mitchell

We made an app to help track your daily calories from dining at Duke. It was built to better inform your dining decisions with information like calories, grams of fat, protein, and sugars about food options on campus, along with helpful nutritional metrics like daily caloric intake and weekly averages. 

Steps to run this locally
Installing NodeJS and running the app locally
Clone this repository
Download NodeJS if you haven't already https://nodejs.org/en/download. (Get the LTS, and download using default settings)
Open this repository
In the terminal, install yarn with npm install --global yarn (yarn is a NodeJS package manager, and is an alternative to npm)
In the terminal, install dependencies with yarn install
Getting Firebase
Go to https://firebase.google.com/, click "Get Started", and log in with your Google account
Click "Add Project"
Name your project "ignite-2023"
Click "Create Project". Note: You can disable Google Analytics - you won't be needing it
Click "Web" to add Firebase to a web app (the logo looks like this: </>)
Nickname your app "ignite-2023". Do not select Hosting (we don't need it)
Copy your firebaseConfig object! It looks like this: const firebaseConfig = {   apiKey: "api key here"   authDomain: "auth domain here",   projectId: "project id here",   storageBucket: "storage bucket here",   messagingSenderId: "messaging sender id here",   appId: "app id here",   measurementId: "measurement id here", };.
Paste the config object in /firebase/config.txt. Then, change the filename from config.txt to config.ts
Continue to console, and go to sidebar -> Build -> Athentication, and enable Google sign-in. For your own apps, you can enable any other type of sign-in you want, but for this workshop, we'll be using Google sign-in.
Go back to Build -> Storage -> Get Started -> Start in test mode -> next -> done
Make sure Build -> FireStore Database is set up. If not, run it in test mode
Important: Go to Firestore Database -> rules -> change the line to this: allow read, write: if request.auth != null;
Running the app
Run the app with yarn dev
Open http://localhost:3000 in your browser
