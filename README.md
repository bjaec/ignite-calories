# Duke Ignite Firebase Workshop 2023: Remaking Mobile Order

Welcome to Duke Ignite 2023! We're glad you're here. This repository will show you how to use
Firebase to create a simple mobile ordering app. This app will allow users to order food from
a restaurant and view their order history. The frontend was built using NextJS, which is a
React framework.

## Steps to run this locally

### Installing NodeJS and running the app locally

1. Clone this repository
1. Download NodeJS if you haven't already https://nodejs.org/en/download. (Get the LTS, and download using default settings)
1. Open this repository
1. In the terminal, install yarn with `npm install --global yarn` (yarn is a NodeJS package manager, and is an alternative to npm)
1. In the terminal, install dependencies with `yarn install`

### Getting Firebase

1. Go to https://firebase.google.com/, click "Get Started", and log in with your Google account
1. Click "Add Project"
1. Name your project "ignite-2023"
1. Click "Create Project". Note: You can disable Google Analytics - you won't be needing it
1. Click "Web" to add Firebase to a web app (the logo looks like this: </>)
1. Nickname your app "ignite-2023". Do not select Hosting (we don't need it)
1. Copy your firebaseConfig object! It looks like this: `const firebaseConfig = {
  apiKey: "api key here"
  authDomain: "auth domain here",
  projectId: "project id here",
  storageBucket: "storage bucket here",
  messagingSenderId: "messaging sender id here",
  appId: "app id here",
  measurementId: "measurement id here",
};`.
1. Paste the config object in /firebase/config.txt. Then, change the filename from `config.txt` to `config.ts`
1. Continue to console, and go to sidebar -> Build -> Athentication, and enable Google sign-in. For your own apps, you can enable any other type of sign-in you want, but for this workshop, we'll be using Google sign-in.
1. Go back to Build -> Storage -> Get Started -> **Start in test mode** -> next -> done
1. Make sure Build -> FireStore Database is set up. If not, run it in test mode
1. Important: Go to Firestore Database -> rules -> change the line to this: `allow read, write: if request.auth != null;`

### Running the app

1. Run the app with `yarn dev`
1. Open http://localhost:3000 in your browser
1. There you go! Let someone know if you have any problems

This repo was put together by Joe Zakielarz, Duke '24.
