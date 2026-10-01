const ADMIN_API_URL =
  "https://script.google.com/macros/s/AKfycbx46FxCXfS_XOCOEWoETlb9Me2Qcyau005Olwmw8DK-J6VN2IoQa2fH61X7Thba9BHc/exec";


async function adminPost(data) {

  const response = await fetch(ADMIN_API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify(data)
  });

  return await response.json();
}


function adminMessage(message, type = "info") {

  const box =
    document.getElementById("adminMessage");

  if (!box) return;

  box.textContent = message;

  box.className =
    "form-message " + type;
}


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

      const response =
        await adminPost({

          action: "getTicket",

          ticketId: ticketId,

          /*
           * Admin loading does not yet bypass
           * phone verification.
           *
           * We will add proper admin authentication
           * before this is exposed publicly.
           */

          phone: ""
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

      console.error(error);

      adminMessage(
        "Unable to connect to the server.",
        "error"
      );

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


function escapeAdmin(value) {

  const div =
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;
}
