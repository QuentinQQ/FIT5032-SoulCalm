const {
  onRequest,
} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({
  origin: true,
});

admin.initializeApp();

exports.checkDuplicateAppointment = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {
        email,
        coachId,
        appointmentDate,
      } = req.body;

      if (!email || !coachId || !appointmentDate) {
        res.status(400).send("Missing required fields");
        return;
      }

      const appointmentsRef = admin.firestore().collection("appointments");
      const snapshot = await appointmentsRef
          .where("email", "==", email)
          .where("coachId", "==", coachId)
          .where("appointmentDate", "==", appointmentDate);

      if (!snapshot.empty) {
        res.status(400).send("Duplicate appointment exists");
      } else {
        res.status(200).send("No duplicate appointment found");
      }
    } catch (error) {
      console.error("Error checking duplicate appointment:", error.message);
      res.status(500).send("Error checking duplicate appointment");
    }
  });
});


exports.saveAppointment = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {
        name,
        email,
        phone,
        appointmentDate,
        notes,
        coachId,
        coachName,
      } = req.body;

      if (!name || !email || !appointmentDate || !coachId || !coachName) {
        res.status(400).send("Missing required fields");
        return;
      }

      await admin.firestore().collection("appointments").add({
        name,
        email,
        phone,
        appointmentDate,
        notes,
        coachId,
        coachName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).send("Appointment saved successfully");
    } catch (error) {
      console.error("Error saving appointment:", error.message);
      res.status(500).send("Error saving appointment");
    }
  });
});

const sgMail = require("@sendgrid/mail");
const PDFDocument = require("pdfkit");
const path = require("path");
const os = require("os");
const fs = require("fs");

sgMail.setApiKey(
    "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",
);

exports.generatePdfAndSendEmail = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const {
        name,
        email,
        coachName,
        appointmentDate,
        notes,
      } = req.body;

      if (!name || !email || !coachName || !appointmentDate) {
        res.status(400).send("Missing required fields");
        return;
      }

      // generate PDF
      const doc = new PDFDocument();
      const tempFilePath = path
          .join(os.tmpdir(), "appointment-confirmation.pdf");
      const stream = fs.createWriteStream(tempFilePath);

      doc.pipe(stream);
      doc.fontSize(20).text("Appointment Confirmation", {
        align: "center",
      });
      doc.fontSize(14).text(`Dear ${name},`, {
        align: "left",
      });
      doc.text(`Your appointment with ${coachName} has been confirmed.`, {
        align: "left",
      });
      doc.text(`Date: ${appointmentDate}`, {
        align: "left",
      });
      doc.text(`Notes: ${notes || "N/A"}`, {
        align: "left",
      });
      doc.end();

      stream.on("finish", async () => {
        try {
          const msg = {
            to: email,
            from: "your-email@example.com",
            subject: "Appointment Confirmation",
            text: `Your appointment with ${coachName} has been confirmed.`,
            attachments: [{
              content: fs.readFileSync(tempFilePath).toString("base64"),
              filename: "appointment-confirmation.pdf",
              type: "application/pdf",
              disposition: "attachment",
            }],
          };

          await sgMail.send(msg);
          fs.unlinkSync(tempFilePath);
          res.status(200).send("Email sent successfully");
        } catch (error) {
          console.error("Error sending email:", error.message);
          res.status(500).send("Error sending email");
        }
      });
    } catch (error) {
      console.error("Error generating PDF:", error.message);
      res.status(500).send("Error generating PDF");
    }
  });
});
