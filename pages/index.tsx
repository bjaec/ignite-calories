import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { SyncLoader } from "react-spinners";
import { useAuthState } from "react-firebase-hooks/auth";
import Accordion from './Accordion';
import data from '../data/data.json';


// firebase setup
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase/config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
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

const app = initializeApp(firebaseConfig);
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
  timestamp: Date;
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

const restaurants: Restaurant[] = data.nutrition;


export default function Home() {
  const [loadingUserdata, setLoadingUserdata] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[] | null>(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalSugars, setTotalSugars] = useState(0);
  const [averageCalories, setAverageCalories] = useState(0);
  const [averageProtein, setAverageProtein] = useState(0);
  const [averageCarbs, setAverageCarbs] = useState(0);
  const [averageSugars, setAverageSugars] = useState(0);
  const [weeklyAverageCalories, setWeeklyAverageCalories] = useState(0);
  const [weeklyAverageProtein, setWeeklyAverageProtein] = useState(0);
  const [weeklyAverageCarbs, setWeeklyAverageCarbs] = useState(0);
  const [weeklyAverageSugars, setWeeklyAverageSugars] = useState(0);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [dailyProtein, setDailyProtein] = useState(0);
  const [dailyCarbs, setDailyCarbs] = useState(0);
  const [dailySugars, setDailySugars] = useState(0);

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
      } else {
        // If data not pushed yet, push to database!

        await setDoc(
          doc(firestore, "users", user.uid),
          {
            name: user?.displayName ? user?.displayName : "",
            biography: "",
            year: "",
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

  
  // calculate nutrional metrics
  useEffect(() => {
    if (orderHistory) {
      // set lifetime nutritional metrics
      const caloriesSum = orderHistory.reduce((acc: any, curr: any) => acc + curr.calories, 0);
      setTotalCalories(caloriesSum);
      const proteinSum = orderHistory.reduce((acc: any, curr: any) => acc + curr.protein, 0);
      setTotalProtein(proteinSum);
      const carbsSum = orderHistory.reduce((acc: any, curr: any) => acc + curr.carbs, 0);
      setTotalCarbs(carbsSum);
      const sugarSum = orderHistory.reduce((acc: any, curr: any) => acc + curr.sugars, 0);
      setTotalSugars(sugarSum);

      const ONE_WEEK_IN_MS = 604800000; // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
      const ONE_DAY_IN_MS = 86400000; // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

      const curr = new Date();
      const oneWeekAgo = new Date(curr.getTime() - ONE_WEEK_IN_MS);
      const oneDayAgo = new Date(curr.getTime() - ONE_DAY_IN_MS);

      // filter for orders from the past week
      const ordersThisWeek = orderHistory.filter((order: Order) => {
        const orderDate = order.timestamp.toDate();
        return orderDate >= oneWeekAgo && orderDate <= curr;
      });

      // calculate the total calories for the week
      const totalCalories = ordersThisWeek.reduce((acc: any, curr: any) => acc + Number(curr.calories), 0);
      const totalProtein = ordersThisWeek.reduce((acc: any, curr: any) => acc + Number(curr.protein), 0);
      const totalCarbs = ordersThisWeek.reduce((acc: any, curr: any) => acc + Number(curr.carbs), 0);
      const totalSugars = ordersThisWeek.reduce((acc: any, curr: any) => acc + Number(curr.sugars), 0);

      // Finally, calculate the average calories per order
      let averageCaloriesPerOrder = 0;
      let averageProteinPerOrder = 0;
      let averageCarbsPerOrder = 0;
      let averageSugarsPerOrder = 0;
      let wAverageCaloriesPerOrder = 0;
      let wAverageProteinPerOrder = 0;
      let wAverageCarbsPerOrder = 0;
      let wAverageSugarsPerOrder = 0;
      if (ordersThisWeek.length > 0) {
        averageCaloriesPerOrder = parseFloat((totalCalories / ordersThisWeek.length).toFixed(1));
        averageProteinPerOrder = parseFloat((totalProtein / ordersThisWeek.length).toFixed(1));
        averageCarbsPerOrder = parseFloat((totalCarbs / ordersThisWeek.length).toFixed(1));
        averageSugarsPerOrder = parseFloat((totalSugars / ordersThisWeek.length).toFixed(1));
      }
      if (ordersThisWeek.length > 0) {
        wAverageCaloriesPerOrder = parseFloat((totalCalories / 7).toFixed(1));
        wAverageProteinPerOrder = parseFloat((totalProtein / 7).toFixed(1));
        wAverageCarbsPerOrder = parseFloat((totalCarbs / 7).toFixed(1));
        wAverageSugarsPerOrder = parseFloat((totalSugars / 7).toFixed(1));
      }

      //set state of calculated metrics

      setWeeklyAverageCalories(wAverageCaloriesPerOrder);
      setWeeklyAverageProtein(wAverageProteinPerOrder);
      setWeeklyAverageCarbs(wAverageCarbsPerOrder);
      setWeeklyAverageSugars(wAverageSugarsPerOrder);
      
      setAverageCalories(averageCaloriesPerOrder);
      setAverageProtein(averageProteinPerOrder);
      setAverageCarbs(averageCarbsPerOrder);
      setAverageSugars(averageSugarsPerOrder);

      //filter for orders from the past day
      const ordersToday = orderHistory.filter((order: Order) => {
        const orderDate = order.timestamp.toDate();
        return orderDate >= oneDayAgo && orderDate <= curr;
      });

      const dailyTotalCalories = ordersToday.reduce((acc: any, curr: any) => acc + Number(curr.calories), 0);
      const dailyTotalProtein = ordersToday.reduce((acc: any, curr: any) => acc + Number(curr.protein), 0);
      const dailyTotalCarbs = ordersToday.reduce((acc: any, curr: any) => acc + Number(curr.carbs), 0);
      const dailyTotalSugars = ordersToday.reduce((acc: any, curr: any) => acc + Number(curr.sugars), 0);

      // set state of daily metrics

      setDailyCalories(dailyTotalCalories);
      setDailyProtein(dailyTotalProtein);
      setDailyCarbs(dailyTotalCarbs);
      setDailySugars(dailyTotalSugars);


    } else {
      setTotalCalories(0);
      setTotalProtein(0);
      setTotalCarbs(0);
      setTotalSugars(0);
      setAverageCalories(0);
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


  // renders if not logged in
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
                      Daily Total
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {dailyCalories}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {dailyProtein}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {dailyCarbs}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {dailySugars}
                    </td>

                  </tr>

                  <tr className="border border-gray-200">
                    <td className="border border-gray-200 p-2 text-center">
                      Average / Order (Past Week)
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {averageCalories}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {averageProtein}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {averageCarbs}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {averageSugars}
                    </td>

                  </tr>

                  <tr className="border border-gray-200">
                    <td className="border border-gray-200 p-2 text-center">
                      Daily Average (Past Week)
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {weeklyAverageCalories}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {weeklyAverageProtein}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {weeklyAverageCarbs}
                    </td>
                    <td className="border border-gray-200 p-2 text-center">
                      {weeklyAverageSugars}
                    </td>

                  </tr>

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