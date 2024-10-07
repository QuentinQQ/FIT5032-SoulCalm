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
