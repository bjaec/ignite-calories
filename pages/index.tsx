import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase/config";
const app = initializeApp(firebaseConfig);

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const auth = getAuth(app);
const firestore = getFirestore(app);

export default function Home() {
  const [user, loading, error] = useAuthState(auth);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential: any = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        // ...
      });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
        <h1 className="pt-20 text-center text-3xl">Loading...</h1>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
        <h1 className="pt-20 text-center text-3xl">
          Remaking Mobile Order with Firebase and NextJS (React)
        </h1>
        <h3 className="pt-4 text-xl text-gray-700">
          Ignite 2023 Firebase Tutorial
        </h3>

        <button className="bg-blue-300" onClick={signInWithGoogle}>
          Sign In With Google
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
      <h1 className="pt-20 text-center text-3xl">
        Remaking Mobile Order with Firebase and NextJS (React)
      </h1>
      <h3 className="pt-4 text-xl text-gray-700">
        Ignite 2023 Firebase Tutorial
      </h3>
      Signed in!
      <button className="bg-blue-300" onClick={() => signOut(auth)}>
        Sign Out
      </button>
    </main>
  );
}
