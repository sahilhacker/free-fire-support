import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyDY-Y_7WncONJBJ1ZZPxQDatk2QwOR_z6k",
  authDomain: "free-fire-support-510205.firebaseapp.com",
  projectId: "free-fire-support-510205",
  storageBucket: "free-fire-support-510205.firebasestorage.app",
  messagingSenderId: "963006956082",
  appId: "1:963006956082:web:39f5fd359a289f241a322b",
  measurementId: "G-YXJ8RQS5CP"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();


const ADMIN_EMAIL =
  "sksahilamin2019@gmail.com";


const button =
  document.getElementById("googleLogin");

const message =
  document.getElementById("loginMessage");


button.addEventListener("click", async () => {

  button.disabled = true;
  button.textContent = "Signing in...";

  try {

    const result =
      await signInWithPopup(
        auth,
        provider
      );

    const user =
      result.user;

    if (
      user.email?.toLowerCase() !==
      ADMIN_EMAIL.toLowerCase()
    ) {

      await auth.signOut();

      throw new Error(
        "This Google account is not authorized for admin access."
      );
    }

    window.location.href =
      "admin.html";

  } catch (error) {

    console.error(error);

    message.textContent =
      error.message ||
      "Login failed.";

    message.className =
      "form-message error";

    button.disabled = false;
    button.textContent =
      "Continue with Google";
  }

});
