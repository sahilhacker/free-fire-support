const API_URL =
  "https://script.google.com/macros/s/AKfycbx46FxCXfS_XOCOEWoETlb9Me2Qcyau005Olwmw8DK-J6VN2IoQa2fH61X7Thba9BHc/exec";


/* =========================
   API
========================= */

async function postJSON(data) {

  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify(data)
  });

  return await response.json();
}


/* =========================
   HTML SECURITY
========================= */

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    String(text ?? "");

  return div.innerHTML;
}


/* =========================
   FILE → BASE64
========================= */

function fileToBase64(file) {

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();

    reader.onload = () => {

      const result =
        reader.result;

      const base64 =
        result.split(",")[1];

      resolve(base64);
    };

    reader.onerror = () =>
      reject(reader.error);

    reader.readAsDataURL(file);

  });

}


/* =========================
   FILE VALIDATION
========================= */

function validateFiles(
  files,
  maxSizeMB,
  allowedExtensions
) {

  for (const file of files) {

    const sizeMB =
      file.size / (1024 * 1024);

    if (sizeMB > maxSizeMB) {

      return `${file.name} is larger than ${maxSizeMB} MB.`;
    }

    const extension =
      "." +
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    if (
      allowedExtensions.length &&
      !allowedExtensions.includes(extension)
    ) {

      return `${file.name} has an unsupported file type.`;
    }

  }

  return null;
}


/* =========================
   MESSAGE
========================= */

function slideMessage(
  id,
  message,
  type = "info"
) {

  const box =
    document.getElementById(id);

  if (!box) return;

  box.textContent =
    message;

  box.className =
    "message show " + type;
}


/* =========================
   FORM STATE
========================= */

let createdTicketId = "";

let submittedPhone = "";


/* =========================
   SLIDES
========================= */

function showSlide(number) {

  for (let i = 1; i <= 4; i++) {

    const slide =
      document.getElementById(
        "slide" + i
      );

    if (slide) {

      slide.classList.toggle(
        "hidden",
        i !== number
      );

    }

  }


  for (let i = 1; i <= 3; i++) {

    const step =
      document.getElementById(
        "step" + i
      );

    if (step) {

      step.classList.toggle(
        "active",
        i <= number
      );

    }

  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================
   SLIDE 1 → 2
========================= */

function nextSlide(number) {

  if (number === 2) {

    const telegram =
      document
        .getElementById("telegram")
        .value
        .trim();

    const phone =
      document
        .getElementById("phone")
        .value
        .trim();


    if (!telegram || !phone) {

      slideMessage(
        "message1",
        "Telegram username and phone number are required.",
        "error"
      );

      return;
    }

  }


  if (number === 3) {

    const category =
      document
        .getElementById("category")
        .value;

    const subject =
      document
        .getElementById("subject")
        .value
        .trim();

    const complaint =
      document
        .getElementById("complaint")
        .value
        .trim();


    if (
      !category ||
      !subject ||
      !complaint
    ) {

      slideMessage(
        "message2",
        "Please complete the complaint category, subject and complaint details.",
        "error"
      );

      return;
    }


    const photos =
      Array.from(
        document
          .getElementById("photos")
          .files
      );

    const videos =
      Array.from(
        document
          .getElementById("videos")
          .files
      );


    const photoError =
      validateFiles(
        photos,
        2,
        [".jpg", ".jpeg", ".png", ".webp"]
      );

    if (photoError) {

      slideMessage(
        "message2",
        photoError,
        "error"
      );

      return;
    }


    const videoError =
      validateFiles(
        videos,
        25,
        [".mp4", ".mkv"]
      );

    if (videoError) {

      slideMessage(
        "message2",
        videoError,
        "error"
      );

      return;
    }

  }


  showSlide(number);

}


/* =========================
   BACK
========================= */

function previousSlide(number) {

  showSlide(number);

}


/* =========================
   SUBMIT TICKET
========================= */

async function submitTicket() {

  const paymentScreenshot =
    document
      .getElementById("paymentScreenshot")
      .files[0];


  if (!paymentScreenshot) {

    slideMessage(
      "message3",
      "Payment screenshot is required.",
      "error"
    );

    return;
  }


  const paymentError =
    validateFiles(
      [paymentScreenshot],
      2,
      [".jpg", ".jpeg", ".png", ".webp"]
    );


  if (paymentError) {

    slideMessage(
      "message3",
      paymentError,
      "error"
    );

    return;
  }


  const submitBtn =
    document.getElementById(
      "submitBtn"
    );


  submitBtn.disabled =
    true;

  submitBtn.textContent =
    "Creating Ticket...";


  try {

    const telegram =
      document
        .getElementById("telegram")
        .value
        .trim();

    const phone =
      document
        .getElementById("phone")
        .value
        .trim();

    const gameName =
      document
        .getElementById("gameName")
        .value
        .trim();

    const uid =
      document
        .getElementById("uid")
        .value
        .trim();

    const email =
      document
        .getElementById("email")
        .value
        .trim();

    const category =
      document
        .getElementById("category")
        .value;

    const subject =
      document
        .getElementById("subject")
        .value
        .trim();

    const complaint =
      document
        .getElementById("complaint")
        .value
        .trim();


    submittedPhone =
      phone;


    /* CREATE TICKET */

    const ticketResponse =
      await postJSON({

        action:
          "submitTicket",

        data: {

          telegramUsername:
            telegram,

          phone:
            phone,

          inGameName:
            gameName,

          playerUID:
            uid,

          email:
            email,

          category:
            category,

          subject:
            subject,

          complaintDetails:
            complaint

        }

      });


    if (
      !ticketResponse.success ||
      !ticketResponse.ticketId
    ) {

      throw new Error(
        ticketResponse.message ||
        "Could not create ticket."
      );

    }


    createdTicketId =
      ticketResponse.ticketId;


    submitBtn.textContent =
      "Uploading Payment...";


    /* PAYMENT SCREENSHOT */

    await uploadFile(
      paymentScreenshot,
      createdTicketId,
      "Payment Screenshot"
    );


    /* PHOTOS */

    const photos =
      Array.from(
        document
          .getElementById("photos")
          .files
      );


    for (const file of photos) {

      submitBtn.textContent =
        "Uploading Photos...";

      await uploadFile(
        file,
        createdTicketId,
        "Photo"
      );

    }


    /* VIDEOS */

    const videos =
      Array.from(
        document
          .getElementById("videos")
          .files
      );


    for (const file of videos) {

      submitBtn.textContent =
        "Uploading Videos...";

      await uploadFile(
        file,
        createdTicketId,
        "Video"
      );

    }


    /* SUCCESS */

    document.getElementById(
      "finalTicketId"
    ).textContent =
      "#" + createdTicketId;


    document.getElementById(
      "finalStatus"
    ).textContent =
      "Payment verification pending";


    showSlide(4);


  } catch (error) {

    console.error(error);

    slideMessage(
      "message3",
      error.message ||
      "Something went wrong. Please try again.",
      "error"
    );


    submitBtn.disabled =
      false;

    submitBtn.textContent =
      "Submit Ticket";

  }

}


/* =========================
   UPLOAD MEDIA
========================= */

async function uploadFile(
  file,
  ticketId,
  mediaType
) {

  const base64Data =
    await fileToBase64(file);


  const response =
    await postJSON({

      action:
        "uploadMedia",

      data: {

        ticketId:
          ticketId,

        fileName:
          file.name,

        mimeType:
          file.type ||
          "application/octet-stream",

        base64Data:
          base64Data,

        mediaType:
          mediaType

      }

    });


  if (!response.success) {

    throw new Error(
      response.message ||
      `Failed to upload ${file.name}`
    );

  }


  return response;

}


/* =========================
   USER REPLY
========================= */

async function sendUserReply() {

  const messageBox =
    document.getElementById(
      "userReplyMessage"
    );


  const message =
    messageBox.value.trim();


  if (!createdTicketId) {

    slideMessage(
      "message4",
      "Ticket ID is missing.",
      "error"
    );

    return;
  }


  if (!message) {

    slideMessage(
      "message4",
      "Write a message first.",
      "error"
    );

    return;
  }


  try {

    const response =
      await postJSON({

        action:
          "userReply",

        ticketId:
          createdTicketId,

        phone:
          submittedPhone,

        message:
          message

      });


    if (!response.success) {

      throw new Error(
        response.message ||
        "Could not send reply."
      );

    }


    const chat =
      document.getElementById(
        "conversation"
      );


    const msg =
      document.createElement(
        "div"
      );

    msg.className =
      "chat-message user";


    msg.innerHTML = `
      <div class="chat-label">
        You
      </div>
      ${escapeHtml(message)}
    `;


    chat.appendChild(msg);


    messageBox.value =
      "";


    slideMessage(
      "message4",
      "Reply sent successfully.",
      "success"
    );


  } catch (error) {

    console.error(error);

    slideMessage(
      "message4",
      error.message ||
      "Unable to send reply.",
      "error"
    );

  }

}


/* =========================
   TRACK TICKET
========================= */

const trackForm =
  document.getElementById(
    "trackForm"
  );


if (trackForm) {

  trackForm.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const ticketId =
        document
          .getElementById("trackTicketId")
          .value
          .trim();


      const phone =
        document
          .getElementById("trackPhone")
          .value
          .trim();


      const result =
        document.getElementById(
          "ticketResult"
        );


      result.innerHTML =
        '<p class="loading">Searching ticket...</p>';


      try {

        const response =
          await postJSON({

            action:
              "getTicket",

            ticketId:
              ticketId,

            phone:
              phone

          });


        if (!response.success) {

          result.innerHTML =
            `<p class="form-message error">
              ${escapeHtml(
                response.message ||
                "Ticket not found."
              )}
            </p>`;

          return;

        }


        const ticket =
          response.ticket;


        result.innerHTML = `

          <div class="ticket-result">

            <h2>Ticket Found</h2>

            <p>
              <strong>Ticket ID:</strong>
              ${escapeHtml(
                ticket.ticketId || ""
              )}
            </p>

            <p>
              <strong>Status:</strong>
              ${escapeHtml(
                ticket.ticketStatus ||
                "Pending"
              )}
            </p>

            <p>
              <strong>Payment Status:</strong>
              ${escapeHtml(
                ticket.paymentStatus ||
                "Pending"
              )}
            </p>

            <p>
              <strong>Telegram:</strong>
              ${escapeHtml(
                ticket.telegramUsername || ""
              )}
            </p>

            <p>
              <strong>Phone:</strong>
              ${escapeHtml(
                ticket.phone || ""
              )}
            </p>

            <p>
              <strong>In-Game Name:</strong>
              ${escapeHtml(
                ticket.inGameName || ""
              )}
            </p>

            <p>
              <strong>Player UID:</strong>
              ${escapeHtml(
                ticket.playerUID || ""
              )}
            </p>

            <p>
              <strong>Category:</strong>
              ${escapeHtml(
                ticket.category || ""
              )}
            </p>

            <p>
              <strong>Subject:</strong>
              ${escapeHtml(
                ticket.subject || ""
              )}
            </p>

            <div class="ticket-complaint">

              <strong>
                Complaint Details:
              </strong>

              <div class="complaint-text">

                ${escapeHtml(
                  ticket.complaintDetails ||
                  "No complaint details found."
                )}

              </div>

            </div>

          </div>

        `;


      } catch (error) {

        console.error(error);

        result.innerHTML =
          '<p class="form-message error">Unable to connect to the support server.</p>';

      }

    }
  );

}
