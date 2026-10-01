const API_URL =
  "https://script.google.com/macros/s/AKfycbx46FxCXfS_XOCOEWoETlb9Me2Qcyau005Olwmw8DK-J6VN2IoQa2fH61X7Thba9BHc/exec";

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

function showMessage(message, type = "info") {
  const box = document.getElementById("formMessage");

  if (!box) return;

  box.textContent = message;
  box.className = "form-message " + type;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function validateFiles(files, maxSizeMB, allowedExtensions) {
  for (const file of files) {
    const sizeMB = file.size / (1024 * 1024);

    if (sizeMB > maxSizeMB) {
      return `${file.name} is larger than ${maxSizeMB} MB.`;
    }

    const extension =
      "." + file.name.split(".").pop().toLowerCase();

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
   CREATE TICKET
========================= */

const ticketForm = document.getElementById("ticketForm");

if (ticketForm) {
  ticketForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const telegram = document.getElementById("telegram").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const gameName = document.getElementById("gameName").value.trim();
    const uid = document.getElementById("uid").value.trim();
    const email = document.getElementById("email").value.trim();
    const category = document.getElementById("category").value;
    const subject = document.getElementById("subject").value.trim();
    const complaint = document.getElementById("complaint").value.trim();

    const photos = Array.from(
      document.getElementById("photos").files
    );

    const videos = Array.from(
      document.getElementById("videos").files
    );

    const paymentScreenshot =
      document.getElementById("paymentScreenshot").files[0];

    if (!telegram || !phone || !category || !subject || !complaint) {
      showMessage(
        "Please fill all required fields.",
        "error"
      );
      return;
    }

    if (!paymentScreenshot) {
      showMessage(
        "Payment screenshot is required.",
        "error"
      );
      return;
    }

    const photoError = validateFiles(
      photos,
      2,
      [".jpg", ".jpeg", ".png", ".webp"]
    );

    if (photoError) {
      showMessage(photoError, "error");
      return;
    }

    const videoError = validateFiles(
      videos,
      25,
      [".mp4", ".mkv"]
    );

    if (videoError) {
      showMessage(videoError, "error");
      return;
    }

    const paymentError = validateFiles(
      [paymentScreenshot],
      2,
      [".jpg", ".jpeg", ".png", ".webp"]
    );

    if (paymentError) {
      showMessage(paymentError, "error");
      return;
    }

    const submitBtn =
      document.getElementById("submitBtn");

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Ticket...";

    try {
      /* Create ticket first */

      const ticketResponse = await postJSON({
        action: "submitTicket",
        telegram: telegram,
        phone: phone,
        gameName: gameName,
        uid: uid,
        email: email,
        category: category,
        subject: subject,
        complaint: complaint
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

      const ticketId = ticketResponse.ticketId;

      showMessage(
        `Ticket ${ticketId} created. Uploading files...`,
        "success"
      );

      submitBtn.textContent = "Uploading Files...";

      /* Upload payment screenshot */

      await uploadFile(
        paymentScreenshot,
        ticketId,
        "Payment Screenshot"
      );

      /* Upload complaint photos */

      for (const file of photos) {
        await uploadFile(
          file,
          ticketId,
          "Photo"
        );
      }

      /* Upload complaint videos */

      for (const file of videos) {
        await uploadFile(
          file,
          ticketId,
          "Video"
        );
      }

      showMessage(
        `Ticket created successfully!\n\nTicket ID: ${ticketId}\n\nKeep this Ticket ID and your phone number safe for tracking.`,
        "success"
      );

      submitBtn.textContent = "Ticket Submitted";

      ticketForm.reset();

    } catch (error) {
      console.error(error);

      showMessage(
        error.message ||
        "Something went wrong. Please try again.",
        "error"
      );

      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Ticket";
    }
  });
}


/* =========================
   UPLOAD FILE
========================= */

async function uploadFile(file, ticketId, mediaType) {
  const base64Data = await fileToBase64(file);

  const response = await postJSON({
    action: "uploadMedia",
    ticketId: ticketId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    base64Data: base64Data,
    mediaType: mediaType
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
   TRACK TICKET
========================= */

const trackForm = document.getElementById("trackForm");

if (trackForm) {
  trackForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const ticketId =
      document.getElementById("trackTicketId").value.trim();

    const phone =
      document.getElementById("trackPhone").value.trim();

    const result =
      document.getElementById("ticketResult");

    result.innerHTML =
      '<p class="loading">Searching ticket...</p>';

    try {
      const response = await postJSON({
        action: "getTicket",
        ticketId: ticketId,
        phone: phone
      });

      if (!response.success) {
        result.innerHTML =
          `<p class="form-message error">${escapeHtml(
            response.message || "Ticket not found."
          )}</p>`;
        return;
      }

      const ticket = response.ticket;

      result.innerHTML = `
        <div class="ticket-result">
          <h2>Ticket Found</h2>

          <p><strong>Ticket ID:</strong>
          ${escapeHtml(ticket.ticketId || ticket["Ticket ID"] || ticketId)}</p>

          <p><strong>Status:</strong>
          ${escapeHtml(ticket.status || ticket["Status"] || "Pending")}</p>

          <p><strong>Payment Status:</strong>
          ${escapeHtml(ticket.paymentStatus || ticket["Payment Status"] || "Pending")}</p>

          <p><strong>Category:</strong>
          ${escapeHtml(ticket.category || ticket["Category"] || "")}</p>

          <p><strong>Subject:</strong>
          ${escapeHtml(ticket.subject || ticket["Subject"] || "")}</p>

          <p><strong>Complaint:</strong>
          ${escapeHtml(ticket.complaint || ticket["Complaint"] || "")}</p>
        </div>
      `;

    } catch (error) {
      console.error(error);

      result.innerHTML =
        '<p class="form-message error">Unable to connect to the support server.</p>';
    }
  });
}


/* =========================
   SECURITY
========================= */

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text ?? "");
  return div.innerHTML;
}
