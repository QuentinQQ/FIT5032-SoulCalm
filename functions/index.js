const {
  onRequest,
} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({
  origin: true,
});
const sgMail = require("@sendgrid/mail");
const {defineSecret} = require("firebase-functions/params");
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

admin.initializeApp();

const PDFDocument = require("pdfkit");

exports.generatePdf = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const appointmentData = req.body;

      const pdfBuffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        doc.fontSize(20).text("Appointment Confirmation", {
          align: "center",
        });
        doc.moveDown();
        doc.fontSize(14).text(`Dear ${appointmentData.userName},`);
        doc.moveDown();
        doc.text("Your appointment with " +
          `${appointmentData.coachName} has been confirmed for ` +
          `${appointmentData.appointmentDate}.`,
        );
        doc.moveDown();
        if (appointmentData.notes) {
          doc.text(`Notes: ${appointmentData.notes}`);
          doc.moveDown();
        }
        doc.text("Thank you for choosing our service.");

        doc.end();
      });

      const pdfBase64 = pdfBuffer.toString("base64");

      res.status(200).send({
        pdfBase64,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    }
  });
});

exports.getFilteredAppointments = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (!req.headers.authorization) {
        res.status(401)
            .send("User must be authenticated to fetch appointments.");
        return;
      }

      const {
        filters,
        sortCriteria,
        lastDocId,
        itemsPerPage,
        isInitialLoad,
      } = req.body;

      const db = admin.firestore();
      let query = db.collection("appointments");

      // Apply filters
      if (filters.bookingDateStart) {
        query = query.where("appointmentDate", ">=", filters.bookingDateStart);
      }
      if (filters.bookingDateEnd) {
        query = query.where("appointmentDate", "<=", filters.bookingDateEnd);
      }
      if (filters.coachName) {
        query = query.where("coachName", "==", filters.coachName);
      }
      if (filters.userId) {
        query = query.where("userId", "==", filters.userId);
      }
      if (filters.createDateStart) {
        const startDate = new Date(filters.createDateStart);
        startDate.setHours(0, 0, 0, 0);
        query = query.where("createdAt", ">=", startDate);
      }
      if (filters.createDateEnd) {
        const endDate = new Date(filters.createDateEnd);
        endDate.setHours(23, 59, 59, 999);
        query = query.where("createdAt", "<=", endDate);
      }

      // Apply sorting
      if (sortCriteria && sortCriteria.key) {
        query = query.orderBy(sortCriteria.key, sortCriteria.order);
      } else {
        query = query.orderBy("createdAt", "desc");
      }

      // Get total count
      let total = 0;
      if (isInitialLoad || Object.values(filters).some((filter) => filter)) {
        const countSnapshot = await query.count().get();
        total = countSnapshot.data().count;
      }

      // Apply pagination
      if (lastDocId) {
        const lastDocSnapshot = await db
            .collection("appointments").doc(lastDocId).get();
        query = query.startAfter(lastDocSnapshot);
      }
      query = query.limit(itemsPerPage);

      // Execute query
      const querySnapshot = await query.get();

      // Process results
      let appointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        appointmentDate: doc.data().appointmentDate,
      }));

      // Client-side filtering for notes (if needed)
      if (filters.notes) {
        appointments = appointments.filter((app) =>
          app.notes.toLowerCase().includes(filters.notes.toLowerCase()),
        );
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      res.status(200).json({
        appointments,
        lastVisible: lastVisible ? lastVisible.id : null,
        total,
      });
    } catch (error) {
      console.error("Error getting filtered appointments:", error);
      res.status(500).json({error: error.message});
    }
  });
});

exports.getUniqueCoachNames = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (!req.headers.authorization) {
        res.status(401)
            .send("User must be authenticated to fetch coach names.");
        return;
      }

      const db = admin.firestore();
      const appointmentsRef = db.collection("appointments");

      // get all unique coach names
      const snapshot = await appointmentsRef.select("coachName").get();

      // unique coach names
      const uniqueCoaches = new Set();
      snapshot.forEach((doc) => {
        const coachName = doc.get("coachName");
        if (coachName) {
          uniqueCoaches.add(coachName);
        }
      });

      // convert to array and sort
      const sortedCoaches = Array.from(uniqueCoaches).sort();

      res.status(200).json(sortedCoaches);
    } catch (error) {
      console.error("Error getting unique coach names:", error);
      res.status(500).send("Error fetching unique coach names");
    }
  });
});

exports.sendConfirmationEmail = onRequest(
    {secrets: [sendgridApiKey]},
    (req, res) => {
      cors(req, res, async () => {
        console.log("Received request for sendConfirmationEmail");
        try {
          sgMail.setApiKey(sendgridApiKey.value());
          const {
            email,
            name,
            coachName,
            appointmentDate,
            timeSlot,
            notes,
            pdfBase64,
          } = req.body;

          console.log("Request body:", JSON.stringify({
            email,
            name,
            coachName,
            appointmentDate,
            timeSlot,
            notes,
            pdfBase64: pdfBase64?
          "Base64 string present":
          "Base64 string missing",
          }));

          if (
            !email ||
        !name ||
        !coachName ||
        !appointmentDate ||
        !timeSlot ||
        !pdfBase64
          ) {
            console.error("Missing required fields:", {
              email: !!email,
              name: !!name,
              coachName: !!coachName,
              appointmentDate: !!appointmentDate,
              timeSlot: !!timeSlot,
              pdfBase64: !!pdfBase64,
            });
            res.status(400).send("Missing required fields");
            return;
          }

          const msg = {
            to: email,
            from: "zhentao.qian@outlook.com",
            subject: "Your Appointment Confirmation",
            text: `Dear ${name},

Your appointment with ${coachName} has been confirmed for 
${appointmentDate} at ${timeSlot}.

${notes ? `Notes: ${notes}\n\n` : ""}

Thank you for choosing our service.`,
            html: `<p>Dear ${name},</p>
        <p>Your appointment with ${coachName} has been confirmed for 
        ${appointmentDate} at ${timeSlot}.</p>
        ${notes ? `<p>Notes: ${notes}</p>` : ""}
        <p>Thank you for choosing our service.</p>`,
            attachments: [{
              content: pdfBase64,
              filename: "appointment_confirmation.pdf",
              type: "application/pdf",
              disposition: "attachment",
            }],
          };

          console.log("Attempting to send email with SendGrid");
          await sgMail.send(msg);
          console.log("Email sent successfully");

          res.status(200).send({
            message: "Email sent successfully",
          });
        } catch (error) {
          console.error("Detailed SendGrid error:", error);
          if (error.response) {
            console.error("SendGrid API response error:", error.response.body);
          }
          res.status(500).send(`Error sending email: ${error.message}`);
        }
      });
    });


