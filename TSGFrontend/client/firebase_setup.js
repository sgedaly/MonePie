import firebase from '@firebase/app';
import 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyBcFFBgWPNaVlSHYWpbleucPVGckW4W6zc",
  authDomain: "thesavinggame-423a9.firebaseapp.com",
  databaseURL: "https://thesavinggame-423a9.firebaseio.com",
  projectId: "thesavinggame-423a9",
  storageBucket: "thesavinggame-423a9.appspot.com"
}

const Firebase = firebase.initializeApp(firebaseConfig);
export default Firebase;
