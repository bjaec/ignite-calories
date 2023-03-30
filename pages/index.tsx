import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase/config";
const app = initializeApp(firebaseConfig);
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage(app);

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
  const [refresh, setRefresh] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState([
    {
      id: 0,
      name: "Devils Krafthouse Burger, 1 large fry",
      price: "$10.00",
      date: "Mar 26",
    },
  ]);

  useEffect(() => {
    if (!user) return;
    async function getImage() {
      const imageRef = ref(storage, "images/" + "USERID HERE");

      // Get the download URL
      getDownloadURL(imageRef)
        .then((url) => {
          // Insert url into an <img> tag to "download"
          console.log("FOUND URL", url);
          setImage(url);
        })
        .catch((error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/object-not-found":
              // File doesn't exist
              console.log("file doesn't exist");
              break;
            case "storage/unauthorized":
              console.log("unauthorized");
              // User doesn't have permission to access the object
              break;
            case "storage/canceled":
              console.log("user canceled upload");
              // User canceled the upload
              break;

            // ...

            case "storage/unknown":
              // Unknown error occurred, inspect the server response
              console.log("unknown error");
              break;
          }
        });
    }

    getImage();
  }, [user, refresh]);

  async function uploadImage(img: File | null) {
    if (!img) return;
    const storageRef = ref(storage, "images/" + "USERID HERE");

    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, img as File).then((snapshot) => {
      console.log("Uploaded a blob or file!", snapshot);
      setRefresh(!refresh);
    });
  }

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
        <div className="max-w-5xl mx-auto">
          <h1 className="pt-20 text-center text-3xl">
            Ignite 2023 Firebase Tutorial
          </h1>
          <h3 className="pt-4 text-xl text-gray-700">
            Remaking Mobile Order with Firebase
          </h3>

          <div className="my-20 border-t-2 border-gray-300" />
          <button
            className="bg-blue-400 px-4 py-2 border border-black text-lg rounded-lg hover:opacity-80"
            onClick={signInWithGoogle}
          >
            Sign In With Google
          </button>
        </div>
      </main>
    );
  }

  const restaurants = [
    {
      name: "Devils Krafthouse",
      food: "BBQ Chicken Burger",
      price: "$10.00",
    },
    {
      name: "Devils Krafthouse",
      food: "BBQ Chicken Burger",
      price: "$10.00",
    },
    {
      name: "Devils Krafthouse",
      food: "BBQ Chicken Burger",
      price: "$10.00",
    },
    {
      name: "Devils Krafthouse",
      food: "BBQ Chicken Burger",
      price: "$10.00",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 text-center ">
      <div className="max-w-5xl mx-auto">
        <h1 className="pt-20 text-center text-3xl">
          Ignite 2023 Firebase Tutorial
        </h1>
        <h3 className="pt-4 text-xl text-gray-700">
          Remaking Mobile Order with Firebase
        </h3>

        {/* Order */}
        <h2 className="pt-4 mt-8 font-bold text-left border-t-2 border-gray-300">
          Order
        </h2>
        <table className="w-full border-collapse border border-gray-200 mt-8">
          <thead>
            <tr className="border border-gray-200">
              <th className="border border-gray-200 p-2">Name</th>
              <th className="border border-gray-200 p-2">Food</th>
              <th className="border border-gray-200 p-2">Price</th>
              <th className="border border-gray-200 p-2">Order</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((row: any, i: number) => (
              <tr key={i} className="border border-gray-200">
                <td className="border border-gray-200 p-2 text-center">
                  {row.name}
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  {row.food}
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  {row.price}
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  <button className="bg-black rounded-lg px-4 py-2 text-white">
                    order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Order History */}
        <h2 className="pt-4 mt-8 font-bold text-left border-t-2 border-gray-300">
          Order History
        </h2>
        <table className="w-full border-collapse border border-gray-200 mt-2">
          <thead>
            <tr className="border border-gray-200">
              <th className="border border-gray-200 p-2">Order</th>
              <th className="border border-gray-200 p-2">Price</th>
              <th className="border border-gray-200 p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orderHistory.map((row: any, i: number) => (
              <tr key={i} className="border border-gray-200">
                <td className="border border-gray-200 p-2 text-center">
                  {row.name}
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  {row.price}
                </td>
                <td className="border border-gray-200 p-2 text-center">
                  {row.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Settings */}
        <h2 className="pt-4 mt-8 font-bold text-left border-t-2 border-gray-300">
          Settings
        </h2>
        <div className="mt-2 flex  bg-blue-300">
          <div className="flex flex-col gap-3 w-full">
            <input
              className="border border-gray-200 rounded-lg px-4 py-2 w-1/2"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          <div className="flex flex-col w-full items-center justify-center">
            {image ? (
              <Image
                src={image}
                alt="Image"
                width="200"
                height="200"
                draggable="false"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-300" />
            )}
            <p>Upload profile photo:</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  uploadImage(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        <button
          className="bg-black px-12 py-3 rounded-lg text-white hover:opacity-80"
          onClick={() => signOut(auth)}
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
