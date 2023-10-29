import {initializeApp} from 'firebase/app';
import {GoogleAuthProvider, getAuth, connectAuthEmulator} from 'firebase/auth';
import {connectFirestoreEmulator, getFirestore} from 'firebase/firestore';
import {connectFunctionsEmulator, getFunctions} from 'firebase/functions';
import {DEV} from '../env.js';

const firebaseConfig = {};

export const firebase = initializeApp(firebaseConfig);
export const firestore = getFirestore();
export const auth = getAuth();
export const functions = getFunctions();

// Connect the emulators during development
if (DEV) {
	const host = 'localhost';
	// const host = '192.168.1.168'
	connectFirestoreEmulator(firestore, host, 8080);
	connectAuthEmulator(auth, `http://${host}:9099`);
	connectFunctionsEmulator(functions, host, 5001);
	// Remove the bottom notice
	document.body.querySelector('.firebase-emulator-warning')?.remove();
}

export const googleAuthProvider = new GoogleAuthProvider();
export {signInWithPopup} from 'firebase/auth';
