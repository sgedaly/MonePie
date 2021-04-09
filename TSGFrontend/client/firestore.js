import Firebase from './firebase_setup.js';

const firestore = Firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);
export default firestore;