import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase/config";
const app = initializeApp(firebaseConfig);
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast, { Toaster } from "react-hot-toast";
import { SyncLoader } from "react-spinners";
import * as React from 'react';
import Accordion from './Accordion';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  Timestamp,
  arrayUnion,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

type Order = {
  name: string;
  price: string;
  calories: string;
  protein: string;
  carbs: string;
  sugars: string;
};

type Restaurant = {
  name: string;
  items: {
    food: string;
    calories: number;
    protein: number;
    carbs: number;
    sugars: number;
  }[];
};

const restaurants: Restaurant[] = [
  {
    name: "Il Forno",
    items: [
    {
    food: "Chicken Basil Pesto Pasta",
    calories: 800,
    protein: 36,
    carbs: 110,
    sugars: 3,
    },
    {
    food: "Meatball and Spaghetti Pasta",
    calories: 380,
    protein: 18,
    carbs: 46,
    sugars: 3,
    },
    {
    food: "Parma Rosa",
    calories: 440,
    protein: 30,
    carbs: 49,
    sugars: 5,
    },
    {
    food: "Salmon Alfredo Pasta",
    calories: 430,
    protein: 26,
    carbs: 43,
    sugars: 1,
    },
    {
    food: "Spicy Il Forno Pasta",
    calories: 480,
    protein: 19,
    carbs: 50,
    sugars: 8,
    },
    {
    food: "Buffalo Chicken Pasta",
    calories: 1450,
    protein: 62,
    carbs: 154,
    sugars: 14,
    },
    {
    food: "Kyle's BBQ Pizza",
    calories: 1350,
    protein: 45,
    carbs: 167,
    sugars: 12,
    },
    {
    food: "Margarita Pizza",
    calories: 1020,
    protein: 33,
    carbs: 132,
    sugars: 12,
    },
    {
    food: "PJ's New Yorker",
    calories: 1220,
    protein: 50,
    carbs: 146,
    sugars: 15,
    },
    ],
    },
    {
    name: "Gyotaku",
    items: [
    {
    food: "Arctic Sushi Burrito",
    calories: 360,
    protein: 14,
    carbs: 49,
    sugars: 11,
    },
    {
    food: "Blossom Roll",
    calories: 420,
    protein: 22,
    carbs: 42,
    sugars: 10,
    },
    {
    food: "Dancing Eel Roll",
    calories: 390,
    protein: 15,
    carbs: 45,
    sugars: 11,
    },
    {
    food: "Salmon Crunch Roll",
    calories: 350,
    protein: 19,
    carbs: 35,
    sugars: 8,
    },
    {
    food: "Shrimp Tempura Roll",
    calories: 320,
    protein: 10,
    carbs: 42,
    sugars: 9,
    },
    ],
    },
    {
    name: "Panera Bread",
    items: [
    {
    food: "Bacon Egg Cheese on Asiago Cheese Bagel",
    calories: 510,
    protein: 20,
    carbs: 60,
    sugars: 6,
    },
    {
    food: "Chipotle Chicken Scr Egg & Avocado Wrap",
    calories: 470,
    protein: 29,
    carbs: 32,
    sugars: 4,
    },
    ],
    },
    {
    name: "The Farmstead",
    items: [
    {
    food: "Honey Garlic Chicken",
    calories: 320,
    protein: 31,
    carbs: 29,
    sugars: 23,
    },
    {
    food: "Herb Roasted Turkey",
    calories: 270,
    protein: 40,
    carbs: 1,
    sugars: 0,
    },
    {
    food: "Gyro Sandwich",
      calories: 680,
      protein: 26,
      carbs: 52,
      sugars: 6,
    },{
      food: "Kobe Beef Sliders",
      calories: 330,
      protein: 14,
      carbs: 21,
      sugars: 4,
    },{
      food: "Turkey Avocado Sandwich",
      calories: 600,
      protein: 33,
      carbs: 52,
      sugars: 8,
    },
    
    
    ], 
    },
    {
      name: "Tandoor Indian Cuisine",
      items: [
        {
          food: "Beef Vindaloo",
          calories: 200,
          protein: 32,
          carbs: 3,
          sugars: 1,
        },
      {
          food: "Chicken Tikka Dosai",
          calories: 120,
          protein: 3,
          carbs: 22,
          sugars: 1,
        },{
          food: "Basmati Rice Pilaf",
          calories: 220,
          protein: 3,
          carbs: 35,
          sugars: 0,
        },{
          food: "Chicken Biryani",
          calories: 500,
          protein: 17,
          carbs: 74,
          sugars: 1,
        },{
          food: "Chicken 65",
          calories: 180,
          protein: 23,
          carbs: 14,
          sugars: 0,
        },{
          food: "Naan",
          calories: 140,
          protein: 4,
          carbs: 29,
          sugars: 0,
        },{
          food: "Beef Vindaloo",
          calories: 200,
          protein: 32,
          carbs: 3,
          sugars: 1,
        },
      ],
      },
      {
        name: "The Skillet",
        items: [
          {
            food: "Pulled Pork Sandwich",
            calories: 200,
            protein: 34,
            carbs: 35,
            sugars: 5,
          },
        {
            food: "Pulled Pork Sandwich",
            calories: 200,
            protein: 34,
            carbs: 35,
            sugars: 5,
          },{
            food: "Pulled Pork Sandwich",
            calories: 200,
            protein: 34,
            carbs: 35,
            sugars: 5,
          },{
            food: "Potato Wedges",
            calories: 140,
            protein: 3,
            carbs: 23,
            sugars: 0,
          },{
            food: "Pulled Pork Sandwich",
            calories: 200,
            protein: 34,
            carbs: 35,
            sugars: 5,
          },{
            food: "Fried Egg BLT Sandwich",
            calories: 570,
            protein: 19,
            carbs: 6,
            sugars: 0,
          },{
            food: "Grilled Cheese",
            calories: 730,
            protein: 32,
            carbs: 3,
            sugars: 0,
          },{
            food: "Creamy Cole Slaw",
            calories: 170,
            protein: 1,
            carbs: 12,
            sugars: 10,
          },
        
        ],
        },
        {
          name: "The Pitchfork",
          items: [
            {
              food: "Chicken Wings",
              calories: 1120,
              protein: 105,
              carbs: 0,
              sugars: 0,
            },
          {
              food: "Fried Chicken Sandwich",
              calories: 720,
              protein: 27,
              carbs: 52,
              sugars: 11,
            },{
              food: "Grilled Cheese Sandwich",
              calories: 830,
              protein: 30,
              carbs: 48,
              sugars: 0,
            },{
              food: "Pulled Pork Barbecue Sandwich",
              calories: 440,
              protein: 32,
              carbs: 45,
              sugars: 12,
            },{
              food: "Fries",
              calories: 270,
              protein: 4,
              carbs: 40,
              sugars: 2,
            },{
              food: "Tots",
              calories: 340,
              protein: 4,
              carbs: 38,
              sugars: 0,
            },
          ],
          },

];


export default function Home() {
  const [loadingUserdata, setLoadingUserdata] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [foodpoints, setFoodpoints] = useState<number>(0);
  const [image, setImage] = useState<string | null>(null);
  const [nutritionalMetrics, setNutritionalMetrics] = useState<Order[] | null>(null); //initialized with value of null
  //hold array of 'Order' objects, setter function will update the values
  const [orderHistory, setOrderHistory] = useState<Order[] | null>(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalSugars, setTotalSugars] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Get all user data
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

    async function getOrderHistory() {
      const docRef = doc(firestore, "orders", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrderHistory(
          data?.orderList.sort((a: any, b: any) => b.timestamp - a.timestamp)
        );

      } else {
        setOrderHistory(null);
        setNutritionalMetrics(null);
      }
    }

    async function loadEverything() {
      await getSettings();
      await getOrderHistory();
      await getImage();
      setLoadingUserdata(false);
    }

    loadEverything();
  }, [user, refresh]);

  useEffect(() => {
    if (orderHistory) {
      const caloriesSum = orderHistory.reduce((acc: any, curr: any) => acc + curr.calories, 0);
      setTotalCalories(caloriesSum);
      
      const proteinSum = orderHistory.reduce((acc: any, curr: any) => acc + curr.protein, 0);
      setTotalProtein(proteinSum);
      
      const carbsSum = orderHistory.reduce((acc: any, curr: any) => acc + curr.carbs, 0);
      setTotalCarbs(carbsSum);
      
      const sugarSum = orderHistory.reduce((acc: any, curr: any) => acc + curr.sugars, 0);
      setTotalSugars(sugarSum);
    } else {
      setTotalCalories(0);
      setTotalProtein(0);
      setTotalCarbs(0);
      setTotalSugars(0);
    }
  }, [orderHistory]);


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
  async function getOrderHistory() {
    const docRef = doc(firestore, "orders", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setOrderHistory(
        data?.orderList.sort((a: any, b: any) => b.timestamp - a.timestamp)
      );

    } else {
      setOrderHistory(null);
      setNutritionalMetrics(null);
    }
  }

  async function orderItem(row: any, name: any) {
    try {
      await setDoc(
        doc(firestore, "orders", user.uid),
        {
          orderList: arrayUnion({
            name: name + ": " + row.food,
            calories: row.calories,
            protein: row.protein,
            carbs: row.carbs,
            sugars: row.sugars,
            timestamp: Timestamp.fromDate(new Date()),
          }),
        },
        { merge: true }
      );

      // Update foodpoints
      await setDoc(
        doc(firestore, "users", user.uid),
        {
          foodpoints: foodpoints - row.price,
        },
        { merge: true }
      );

      toast("Ordered item", {
        icon: "✅",
      });

      // Refresh to order history
      await getOrderHistory();
    } catch (error) {
      toast("Could not order item", {
        icon: "❌",
      });
    }
  }
  async function clearHistory() {
    try {
      await deleteDoc(doc(firestore, 'orders', user.uid));
      setOrderHistory(null);
    } catch(error) {
      console.error('Error clearing history', error)
    }
    toast("Cleared history", {
      icon: "❌",
    });
  }

  async function removeItem(row: any) {
    try {
      await updateDoc(doc(firestore, 'orders', user.uid), {orderList: arrayRemove(row)});
    } catch (error) {
      console.error('Error removing item: ', error);
    }
    toast("Removed item", {
      icon: "❌",
    });
    
    // refresh order history
    getOrderHistory();
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
      <>
        <Head>
          <title>Duke Dining Nutrition Tracker</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
          <div className="pt-20 text-center text-3xl">
            <SyncLoader color="black" />
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Nutrition Tracker</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
          <h1 className="pt-20 text-center text-3xl">
            Uh oh.. error with Firebase Auth!
          </h1>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Nutrition Tracker</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="pt-20 text-center text-3xl">
              Nutrition Tracker
            </h1>
            <a
              href="https://github.com/JJZFIVE"
              rel="noreferrer"
              target="_blank"
              className="w-fit mt-3"
            >
              <p className=" text-gray-600 text-xs mt-3">By Josh Chen, Bryant Chung, Dylan Mitchell</p>
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
      </>
    );
  }

  // Renders this if fetching user data
  if (user && loadingUserdata) {
    return (
      <>
        <Head>
          <title>Nutrition Tracker</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen bg-gray-100 text-gray-800 text-center">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="pt-20 text-center text-3xl">
              Nutrition Tracker
            </h1>
            <a
              href="https://github.com/joshisacow/ignite-calories"
              rel="noreferrer"
              target="_blank"
              className="w-fit mt-3"
            >
              <p className=" text-gray-600 text-xs mt-3">By Josh Chen, Bryant Chung, Dylan Mitchell</p>
            </a>

            <div className="my-20 border-t-2 border-gray-300" />
            <SyncLoader color="black" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Nutrition Tracker</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100 text-gray-800 text-center ">
        <Toaster />
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="pt-20 text-center text-3xl">
            Nutrition Tracker
          </h1>
          <a
            href="https://github.com/joshisacow/ignite-calories"
            rel="noreferrer"
            target="_blank"
            className="w-fit mt-3"
          >
            <p className=" text-gray-600 text-xs mt-3">By Josh Chen, Bryant Chung, Dylan Mitchell</p>
          </a>

          {/* Order */}
          <div className="flex justify-between pt-4 mt-8  border-t-2 border-gray-300 ">
            <h2 className="font-bold text-left text-xl">Order</h2>
          </div>
          <table className="w-full border-collapse border border-gray-200 mt-4">
            <tbody>
              {restaurants.map((restaurant: any, i: number) => (
                <React.Fragment key={i}>
                  <Accordion 
                  label={restaurant.name}
                  >
                    <table>
                      <tbody>
                        <tr className="border border-gray-200" >
                          <th className="border border-gray-200 p-2 w-1/3">Food</th>
                          <th className="border border-gray-200 p-2 w-1/6">Calories</th>
                          <th className="border border-gray-200 p-2 w-1/6">Protein (g)</th>
                          <th className="border border-gray-200 p-2 w-1/6">Carbs (g)</th>
                          <th className="border border-gray-200 p-2 w-1/6">Sugars (g)</th>
                          <th className="w-0"></th>
                        </tr>
                        {restaurant.items.map((item: any, j: number) => (
                          <tr key={`${i}-${j}`}>
                            <td className="border border-gray-200 p-2 text-center">{item.food}</td>
                            <td className="border border-gray-200 p-2 text-center">{item.calories}</td>
                            <td className="border border-gray-200 p-2 text-center">{item.protein}</td>
                            <td className="border border-gray-200 p-2 text-center">{item.carbs}</td>
                            <td className="border border-gray-200 p-2 text-center">{item.sugars}</td>
                            <td>
                              <button
                                className="bg-black rounded-lg px-4 py-2 text-white"
                                onClick={() => orderItem(item, restaurant.name)}
                              >
                                add
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Accordion>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Nutritional Metrics */}
          <h2 className="pt-4 mt-8 font-bold text-left border-t-2 border-gray-300 text-xl">Nutritional Metrics</h2>
            <table className="w-full border-collapse border border-gray-200 mt-4">
                <thead>
                  <tr className="border border-gray-200">
                    <th className="border border-gray-200 p-2">Total</th>
                    <th className="border border-gray-200 p-2">Calories</th>
                    <th className="border border-gray-200 p-2">Protein (g)</th>
                    <th className="border border-gray-200 p-2">Carbs (g)</th>
                    <th className="border border-gray-200 p-2">Sugar (g)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-gray-200">
                    <td className="border border-gray-200 p-2 text-center">
                      Lifetime Total
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {totalCalories}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {totalProtein}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {totalCarbs}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {totalSugars}
                    </td>
                  </tr>
                </tbody>
            </table>
          
          {/* Order History */}
          <div className="flex justify-between items-center border-t-2 border-gray-300 pt-4 mt-8">
            <h2 className="font-bold text-left text-xl">Order History</h2>
            <button
              className="bg-black rounded-lg px-4 py-2 text-white text-right"
              onClick={() => clearHistory()}
            >
              clear
            </button>
          </div>  
          {orderHistory ? (
            <table className="w-full border-collapse border border-gray-200 mt-4">
              <thead>
                <tr className="border border-gray-200">
                  <th className="border border-gray-200 p-2">Order</th>
                  <th className="border border-gray-200 p-2">Calories</th>
                  <th className="border border-gray-200 p-2">Protein (g)</th>
                  <th className="border border-gray-200 p-2">Carbs (g)</th>
                  <th className="border border-gray-200 p-2">Sugar (g)</th>
                  <th className="border border-gray-200 p-2">Date</th>
                  <th className="border border-gray-200 p-2">Remove</th>
                </tr>
              </thead>
              <tbody>
                
                {orderHistory.map((row: any, i: number) => (
                  <tr key={i} className="border border-gray-200">
                    <td className="border border-gray-200 p-2 text-center">
                      {row.name}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {row.calories}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {row.protein}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {row.carbs}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {row.sugars}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {row.timestamp.toDate().toLocaleString()}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      <button
                        className="bg-black rounded-lg px-4 py-2 text-white"
                        onClick={() => removeItem(row)}
                      >
                        remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No order history. Order something!</p>
          )}

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
                <label className="text-lg w-32 text-left">Email: </label>
                <input
                  className="border border-gray-200 rounded-lg px-4 py-2 w-1/2"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
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
    </>
  );
}