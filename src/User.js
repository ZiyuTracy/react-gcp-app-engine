import { initializeApp } from 'firebase/app';
import { getAuth, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import React, {  useState, useEffect } from 'react';

// LoginSuccessful is a function sent in by parent component
function User({LoginEvent}) {
	const firebaseConfig = {
		apiKey: "AIzaSyBDt4i9LMe0rYI-KQiDJdEjAuYhqa31VUo",
		authDomain: "user-d95d5.firebaseapp.com",
		projectId: "user-d95d5",
		storageBucket: "user-d95d5.appspot.com",
		messagingSenderId: "90544272669",
		appId: "1:90544272669:web:9eed169b1940a96ea81df4",
		measurementId: "G-R2228S6KYC"
	};

	initializeApp(firebaseConfig);
	
	const [loggedUser, setLoggedUser] = useState('');

	// function to sign in with Google's page
	const signInWithGoogle = () => {
  	
  		const provider = new GoogleAuthProvider();
  		const auth = getAuth();
  		signInWithRedirect(auth, provider)
    	.then((result) => {
      		// User signed in
      		console.log(result.user);
      		setLoggedUser(result.user)
      	
    	}).catch((error) => {
      	// Handle Errors here.
      		console.error(error);
    	});
	};
	
	// function to sign out
	function logoutGoogle () {
		const auth=getAuth();
		auth.signOut();
		setLoggedUser(null)
	}

	// we put the onAuthStateChanged in useEffect so this is only called when 
	// this component mounts  
	useEffect(() => {
		const auth = getAuth();
		auth.onAuthStateChanged(user => {
			if (user) {
    			// User is signed in.
    			console.log("User is signed in:", user);
    			
    			
    			setLoggedUser(user);
    		
  			} else {
    		// No user is signed in.
    			console.log("No user is signed in.");
  			}
  			LoginEvent(user);
  		});
	}, []);
	// note the ? to show either login or logout button
	return (
    <div >
    { loggedUser?
      <>
      {/* <p>user: {loggedUser.uid}</p>  */}
      <button onClick={logoutGoogle}>Log out</button> 
      </>
      :<button onClick={signInWithGoogle}>Sign in with Google</button>
    } 
     
    </div>
  );

}
export default User;