import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
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

const ADMIN_EMAIL =
  "sksahilamin2019@gmail.com";

const ADMIN_API_URL =
  "https://script.google.com/macros/s/AKfycbx46FxCXfS_XOCOEWoETlb9Me2Qcyau005Olwmw8DK-J6VN2IoQa2fH61X7Thba9BHc/exec";


async function getAdminToken() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Admin login required.");
  }

  if (
    user.email?.toLowerCase() !==
    ADMIN_EMAIL.toLowerCase()
  ) {
    throw new Error("Unauthorized admin account.");
  }

  return await user.getIdToken();
}


async function adminPost(data) {

  const idToken = await getAdminToken();

  data.idToken = idToken;

  const response = await fetch(ADMIN_API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify(data)
  });

  return await response.json();
}


onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href =
      "admin-login.html";
    return;
  }

  if (
    user.email?.toLowerCase() !==
    ADMIN_EMAIL.toLowerCase()
  ) {
    auth.signOut();
    return;
  }

});


/* =========================
   LOAD TICKET
========================= */

document
  .getElementById("loadTicketBtn")
  ?.addEventListener("click", async function () {

    const ticketId =
      document.getElementById("adminTicketId")
        .value
        .trim();

    if (!ticketId) {

      adminMessage(
        "Enter a Ticket ID.",
        "error"
      );

      return;
    }

    adminMessage(
      "Loading ticket...",
      "info"
    );

    try {

     const response = await adminPost({
  action: "adminGetTicket",
  ticketId: ticketId
});


      if (!response.success) {

        adminMessage(
          response.message ||
          "Ticket not found.",
          "error"
        );

        return;
      }


      const ticket =
        response.ticket;


      document.getElementById(
        "adminTicket"
      ).style.display = "block";


      document.getElementById(
        "ticketInformation"
      ).innerHTML = `

        <p>
          <strong>Ticket ID:</strong>
          ${escapeAdmin(ticket.ticketId)}
        </p>

        <p>
          <strong>Telegram:</strong>
          ${escapeAdmin(ticket.telegramUsername)}
        </p>

        <p>
          <strong>Phone:</strong>
          ${escapeAdmin(ticket.phone)}
        </p>

        <p>
          <strong>In-Game Name:</strong>
          ${escapeAdmin(ticket.inGameName)}
        </p>

        <p>
          <strong>UID:</strong>
          ${escapeAdmin(ticket.playerUID)}
        </p>

        <p>
          <strong>Email:</strong>
          ${escapeAdmin(ticket.email)}
        </p>

        <p>
          <strong>Category:</strong>
          ${escapeAdmin(ticket.category)}
        </p>

        <p>
          <strong>Subject:</strong>
          ${escapeAdmin(ticket.subject)}
        </p>

        <p>
          <strong>Complaint:</strong>
          ${escapeAdmin(ticket.complaintDetails)}
        </p>

        <p>
          <strong>Current Status:</strong>
          ${escapeAdmin(ticket.ticketStatus)}
        </p>

        <p>
          <strong>Payment Status:</strong>
          ${escapeAdmin(ticket.paymentStatus)}
        </p>

      `;


      document.getElementById(
        "adminStatus"
      ).value =
        ticket.ticketStatus || "Open";


      document.getElementById(
        "adminPaymentStatus"
      ).value =
        ticket.paymentStatus || "Pending";


      adminMessage(
        "Ticket loaded successfully.",
        "success"
      );


} catch (error) {

  console.error("LOAD TICKET ERROR:", error);

  adminMessage(
    "Error: " + error.message,
    "error"
  );

  alert("LOAD TICKET ERROR:\n\n" + error.message);

}

  
  });


/* =========================
   UPDATE TICKET
========================= */

document
  .getElementById("updateTicketBtn")
  ?.addEventListener("click", async function () {

    const ticketId =
      document.getElementById("adminTicketId")
        .value
        .trim();

    const status =
      document.getElementById("adminStatus")
        .value;

    const paymentStatus =
      document.getElementById(
        "adminPaymentStatus"
      ).value;


    if (!ticketId) {

      adminMessage(
        "Load a ticket first.",
        "error"
      );

      return;
    }


    try {

      const response =
        await adminPost({

          action: "adminUpdateTicket",

          ticketId: ticketId,

          status: status,

          paymentStatus: paymentStatus

        });


      if (!response.success) {

        adminMessage(
          response.message ||
          "Update failed.",
          "error"
        );

        return;
      }


      adminMessage(
        "Ticket updated successfully.",
        "success"
      );


    } catch (error) {

      console.error(error);

      adminMessage(
        "Unable to update ticket.",
        "error"
      );

    }

  });


/* =========================
   ADMIN REPLY
========================= */

document
  .getElementById("sendAdminReplyBtn")
  ?.addEventListener("click", async function () {

    const ticketId =
      document.getElementById("adminTicketId")
        .value
        .trim();

    const message =
      document.getElementById(
        "adminReplyMessage"
      ).value.trim();


    if (!ticketId) {

      adminMessage(
        "Load a ticket first.",
        "error"
      );

      return;
    }


    if (!message) {

      adminMessage(
        "Write a reply first.",
        "error"
      );

      return;
    }


    try {

      const response =
        await adminPost({

          action: "adminReply",

          ticketId: ticketId,

          message: message

        });


      if (!response.success) {

        adminMessage(
          response.message ||
          "Reply failed.",
          "error"
        );

        return;
      }


      document.getElementById(
        "adminReplyMessage"
      ).value = "";


      adminMessage(
        "Reply sent successfully.",
        "success"
      );


    } catch (error) {

      console.error(error);

      adminMessage(
        "Unable to send reply.",
        "error"
      );

    }

  });
function adminMessage(message, type = "info") {

  const box =
    document.getElementById("adminMessage");

  if (!box) return;

  box.textContent = message;

  box.className =
    "form-message " + type;
}

function escapeAdmin(value) {

  const div =
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;
}
