import Image from "next/image";
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase/config";
const app = initializeApp(firebaseConfig);
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast, { Toaster } from "react-hot-toast";
import { SyncLoader } from "react-spinners";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export default function Home() {
  const [loadingUserdata, setLoadingUserdata] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [foodpoints, setFoodpoints] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState([
    {
      id: 0,
      name: "Devils Krafthouse Burger, 1 large fry",
      price: "$10.00",
      date: "Mar 26",
    },
  ]);

  // Get profile photo
  useEffect(() => {
    if (!user) return;

    setLoadingUserdata(true);

    async function getSettings() {
      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data?.name);
        setBiography(data?.biography);
        setYear(data?.year);
        setEmail(user?.email ? user.email : "");
        console.log(data);
        setFoodpoints(data?.foodpoints);
      } else {
        // If data not pushed yet, push to database!

        await setDoc(
          doc(firestore, "users", user.uid),
          {
            name: user?.displayName ? user?.displayName : "",
            biography: "",
            year: "",
            foodpoints: 999,
          },
          { merge: true }
        );

        setName(user?.displayName ? user?.displayName : "");
        setBiography("");
        setYear("");
      }
    }

    async function getImage() {
      const imageRef = ref(storage, "images/" + user.uid);

      // Get the download URL
      getDownloadURL(imageRef)
        .then((url) => {
          // Insert url into an <img> tag to "download"
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

    async function loadEverything() {
      await getSettings();
      await getImage();
      setLoadingUserdata(false);
    }

    loadEverything();
  }, [user, refresh]);

  async function saveSettings() {
    if (!user) return;

    try {
      await setDoc(
        doc(firestore, "users", user.uid),
        {
          name: name,
          biography: biography,
          year: year,
        },
        { merge: true }
      );

      toast("Saved settings", {
        icon: "✅",
      });
    } catch (error) {
      toast("Could not save settings", {
        icon: "❌",
      });
    }
  }

  async function uploadImage(img: File | null) {
    if (!img) return;
    const storageRef = ref(storage, "images/" + user.uid);

    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, img as File).then((snapshot) => {
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
        <div className="pt-20 text-center text-3xl">
          <SyncLoader color="black" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
        <h1 className="pt-20 text-center text-3xl">
          Uh oh.. error with Firebase Auth!
        </h1>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="pt-20 text-center text-3xl">
            Ignite 2023 Firebase Tutorial
          </h1>
          <h3 className="pt-4 text-xl text-gray-700">
            Remaking Mobile Order with Firebase
          </h3>
          <a
            href="https://github.com/JJZFIVE"
            rel="noreferrer"
            target="_blank"
            className="w-fit mt-3"
          >
            <p className=" text-gray-600 text-xs mt-3">By Joe Zakielarz</p>
          </a>

          <div className="my-20 border-t-2 border-gray-300" />
          <button
            className="bg-black px-4 py-2 text-white text-lg rounded-lg hover:opacity-80"
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

  // Renders this if fetchnig user data
  if (user && loadingUserdata) {
    return (
      <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="pt-20 text-center text-3xl">
            Ignite 2023 Firebase Tutorial
          </h1>
          <h3 className="pt-4 text-xl text-gray-700">
            Remaking Mobile Order with Firebase
          </h3>
          <a
            href="https://github.com/JJZFIVE"
            rel="noreferrer"
            target="_blank"
            className="w-fit mt-3"
          >
            <p className=" text-gray-600 text-xs mt-3">By Joe Zakielarz</p>
          </a>

          <div className="my-20 border-t-2 border-gray-300" />
          <SyncLoader color="black" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 text-center ">
      <Toaster />
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="pt-20 text-center text-3xl">
          Ignite 2023 Firebase Tutorial
        </h1>
        <h3 className="pt-4 text-xl text-gray-700">
          Remaking Mobile Order with Firebase
        </h3>
        <a
          href="https://github.com/JJZFIVE"
          rel="noreferrer"
          target="_blank"
          className="w-fit mt-3"
        >
          <p className=" text-gray-600 text-xs mt-3">By Joe Zakielarz</p>
        </a>

        {/* Order */}
        <div className="flex justify-between pt-4 mt-8  border-t-2 border-gray-300 ">
          <h2 className="font-bold text-left text-xl">Order</h2>
          <p>Food Points: ${foodpoints}</p>
        </div>
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
        <h2 className="pt-4 mt-8 font-bold text-left border-t-2 border-gray-300 text-xl">
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
        <h2 className="pt-4 mt-8 font-bold text-left border-t-2 border-gray-300 text-xl">
          Settings
        </h2>
        <div className="mt-2 flex">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex w-full items-center">
              <label className="text-lg w-36 text-left">Name: </label>
              <input
                className="border border-gray-200 rounded-lg px-4 py-2 w-1/2"
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div className="flex w-full items-center gap-4">
              <label className="text-lg w-32 text-left">Biography: </label>
              <input
                className="border border-gray-200 rounded-lg px-4 py-2 w-1/2"
                placeholder="Biography"
                onChange={(e) => setBiography(e.target.value)}
                value={biography}
              />
            </div>
            <div className="flex w-full items-center gap-4">
              <label className="text-lg w-32 text-left">Year: </label>
              <input
                className="border border-gray-200 rounded-lg px-4 py-2 w-1/2"
                placeholder="Year"
                onChange={(e) => setYear(e.target.value)}
                value={year}
              />
            </div>

            <button
              className="mx-auto px-10 py-3 border-2 border-black hover:opacity-80 rounded-lg"
              onClick={saveSettings}
            >
              Save
            </button>
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
              className="ml-28"
            />
          </div>
        </div>

        <div className="py-8 mt-4 border-t-2 border-gray-300">
          <button
            className="bg-black px-12 py-3 rounded-lg text-white hover:opacity-80"
            onClick={() => signOut(auth)}
          >
            Log Out
          </button>
        </div>
      </div>
    </main>
  );
}
