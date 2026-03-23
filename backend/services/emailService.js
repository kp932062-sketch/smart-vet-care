// Generic sendEmail function for password reset and other notifications

// Use SendGrid if SENDGRID_API_KEY is set, otherwise fallback to Nodemailer (local dev)
const sendgrid = require('../sendgrid');
async function sendEmail({ to, subject, text, html }) {
    console.log('📧 [sendEmail] Called with:', { to, subject });
    if (sendgrid.sendgridEnabled) {
        // Use SendGrid in production
        return await sendgrid.sendEmail({ to, subject, text, html });
    }
    if (!transporter) {
        console.log('⚠️ Email not sent - transporter unavailable');
        return { success: false, message: 'Email transporter unavailable' };
    }
    try {
        const mailOptions = {
            from: `SmartVet <${process.env.EMAIL_USER || 'support@smartvet.com'}>`,
            to,
            subject,
            text,
            html
        };
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', result.messageId, '| To:', to, '| Subject:', subject);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.log('❌ Email send failed:', error.message, '| To:', to, '| Subject:', subject);
        console.error(error);
        return { success: false, message: error.message };
    }
}
const nodemailer = require('nodemailer');

console.log('✅ SmartVet Email Service - Ready');

// Initialize transporter
let transporter = null;

async function initializeEmailService() {
    try {
        // ✅ Clean up environment variables (remove quotes if present)
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS?.replace(/"/g, ''); // Remove quotes
        
        console.log('🔧 Email config check:', {
            user: emailUser,
            passLength: emailPass?.length,
            hasUser: !!emailUser,
            hasPass: !!emailPass
        });
        
        if (!emailUser || !emailPass) {
            throw new Error('Missing EMAIL_USER or EMAIL_PASS environment variables');
        }
        
        transporter = nodemailer.createTransport({ // ✅ Fixed: createTransport not createTransporter
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });
        
        // ✅ Test the connection
        await transporter.verify();
        console.log('✅ Email transporter initialized and verified successfully');
        return true;
    } catch (error) {
        console.log('❌ Email transporter failed:', error.message);
        console.log('⚠️ Using fallback email method');
        transporter = null;
        return false;
    }
}

// ✅ Don't initialize immediately - wait for dotenv to load
// initializeEmailService() will be called from server.js after dotenv.config()

function generateDoctorAccessLink(doctorId) {
    const token = `doc_${doctorId}_${Date.now()}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
        uniqueToken: token,
        accessLink: `${frontendUrl.replace(/\/$/, '')}/doctor-dashboard/${token}` // Uses deployed frontend URL if set
    };
}

async function sendDoctorApprovalEmail(doctorData, accessLink) {
        console.log('📧 Sending approval email to:', doctorData.email);
        const subject = 'SmartVet Account Approved - Welcome to Our Professional Network';
        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>SmartVet Account Approved</title>
        </head>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
            <table width="100%" bgcolor="#f9fafb" cellpadding="0" cellspacing="0" style="padding:0;margin:0;">
                <tr><td>
                    <table align="center" width="600" bgcolor="#fff" cellpadding="0" cellspacing="0" style="margin:40px auto;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px #0001;">
                        <tr>
                            <td style="background:linear-gradient(135deg,#059669 0%,#2563eb 100%);padding:36px 28px;text-align:center;color:#fff;">
                                <h2 style="margin-bottom:8px;font-size:28px;">Welcome to SmartVet!</h2>
                                <div style="font-size:18px;">Your account has been approved</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:36px 28px;">
                                <p style="font-size:16px;">Dear Dr. ${doctorData.name},</p>
                                <p>Congratulations! Your SmartVet account has been <b>approved</b>. You can now access your dashboard and start providing care to pet owners.</p>
                                ${accessLink ? `<div style="margin:24px 0 32px 0;"><a href="${accessLink}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:16px 36px;border-radius:8px;font-weight:bold;font-size:18px;">Go to Dashboard</a></div>` : ''}
                                <p style="color:#64748b;font-size:13px;">If you have any questions, contact us at <a href="mailto:support@smartvet.com">support@smartvet.com</a></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background:#1f2937;color:#d1d5db;padding:20px;text-align:center;font-size:13px;">SmartVet Professional Platform</td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>`;
        return await sendEmail({
                to: doctorData.email,
                subject,
                html
        });
}

async function sendDoctorRejectionEmail(doctorData, reason) {
        console.log('📧 Sending professional rejection email to:', doctorData.email);
        const subject = 'Application Status Update - SmartVet Platform';
        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>SmartVet Application Rejected</title>
        </head>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
            <table width="100%" bgcolor="#f9fafb" cellpadding="0" cellspacing="0" style="padding:0;margin:0;">
                <tr><td>
                    <table align="center" width="600" bgcolor="#fff" cellpadding="0" cellspacing="0" style="margin:40px auto;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px #0001;">
                        <tr>
                            <td style="background:linear-gradient(135deg,#f59e42 0%,#ef4444 100%);padding:36px 28px;text-align:center;color:#fff;">
                                <h2 style="margin-bottom:8px;font-size:28px;">Application Update</h2>
                                <div style="font-size:18px;">Your application was not approved</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:36px 28px;">
                                <p style="font-size:16px;">Dear Dr. ${doctorData.name},</p>
                                <p>Thank you for your interest in joining SmartVet. After careful review, we regret to inform you that your application was <b>not approved</b> at this time.</p>
                                <div style="margin:24px 0 32px 0;color:#ef4444;"><b>Reason:</b> ${reason || 'Not specified.'}</div>
                                <p style="color:#64748b;font-size:13px;">If you have questions or wish to reapply, contact us at <a href="mailto:support@vetcare.com">support@vetcare.com</a></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background:#1f2937;color:#d1d5db;padding:20px;text-align:center;font-size:13px;">SmartVet Professional Platform</td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>`;
        return await sendEmail({
                to: doctorData.email,
                subject,
                html
        });
}

async function sendDoctorRemovalEmail(doctorData, reason) {
        console.log('📧 Sending removal email to:', doctorData.email);
        const subject = 'SmartVet Account Status Change - Important Notice';
        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>SmartVet Account Removed</title>
        </head>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
            <table width="100%" bgcolor="#f9fafb" cellpadding="0" cellspacing="0" style="padding:0;margin:0;">
                <tr><td>
                    <table align="center" width="600" bgcolor="#fff" cellpadding="0" cellspacing="0" style="margin:40px auto;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px #0001;">
                        <tr>
                            <td style="background:linear-gradient(135deg,#ef4444 0%,#1f2937 100%);padding:36px 28px;text-align:center;color:#fff;">
                                <h2 style="margin-bottom:8px;font-size:28px;">Account Removed</h2>
                                <div style="font-size:18px;">Your SmartVet account has been removed</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:36px 28px;">
                                <p style="font-size:16px;">Dear Dr. ${doctorData.name},</p>
                                <p>We regret to inform you that your SmartVet account has been <b>removed</b>. You will no longer have access to the platform.</p>
                                <div style="margin:24px 0 32px 0;color:#ef4444;"><b>Reason:</b> ${reason || 'Not specified.'}</div>
                                <p style="color:#64748b;font-size:13px;">If you have questions, contact us at <a href="mailto:support@vetcare.com">support@vetcare.com</a></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background:#1f2937;color:#d1d5db;padding:20px;text-align:center;font-size:13px;">SmartVet Professional Platform</td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>`;
        return await sendEmail({
                to: doctorData.email,
                subject,
                html
        });
}

// ================== NEW: Appointment & Consultation Emails ==================

async function sendAppointmentBookedEmail({ user, doctor, appointment }) {
    const subject = `Appointment Booked - SmartVet with Dr. ${doctor.name}`;
    const html = `
        <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#2563eb 0%,#059669 100%);padding:32px 24px;text-align:center;color:#fff;">
                <h2 style="margin-bottom:8px;">Appointment Booked! ✅</h2>
                <div style="font-size:18px;">with Dr. ${doctor.name}</div>
            </div>
            <div style="padding:32px 24px;">
                <p>Dear ${user.name},</p>
                <p>Your appointment has been successfully booked with <b>Dr. ${doctor.name}</b> for <b>${appointment.petName}</b>.</p>
                <ul style="margin:18px 0 24px 0;padding:0;list-style:none;">
                    <li><b>Date:</b> ${appointment.date}</li>
                    <li><b>Time:</b> ${appointment.time}</li>
                    <li><b>Reason:</b> ${appointment.reason}</li>
                </ul>
                <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin-bottom:18px;">Please be ready 5 minutes before your scheduled time.</div>
                <p style="color:#64748b;font-size:13px;">For any queries, contact us at <a href="mailto:support@smartvet.com">support@smartvet.com</a></p>
            </div>
            <div style="background:#1f2937;color:#d1d5db;padding:18px;text-align:center;font-size:13px;">SmartVet Professional Platform</div>
        </div>
    `;
    return await sendEmail({
        to: user.email,
        subject,
        html
    });
}

async function sendAppointmentBookedDoctorEmail({ doctor, user, appointment }) {
    const subject = `📅 New Appointment Booked - ${user.name} (${appointment.petName})`;
    const html = `
        <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#059669 0%,#2563eb 100%);padding:32px 24px;text-align:center;color:#fff;">
                <h2 style="margin-bottom:8px;">New Appointment Booked</h2>
                <div style="font-size:18px;">with ${user.name} (${appointment.petName})</div>
            </div>
            <div style="padding:32px 24px;">
                <p>Dear Dr. ${doctor.name},</p>
                <p>You have a new appointment booked by <b>${user.name}</b> for <b>${appointment.petName}</b>.</p>
                <ul style="margin:18px 0 24px 0;padding:0;list-style:none;">
                    <li><b>Date:</b> ${appointment.date}</li>
                    <li><b>Time:</b> ${appointment.time}</li>
                    <li><b>Reason:</b> ${appointment.reason}</li>
                </ul>
                <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin-bottom:18px;">Please review the case details in your SmartVet dashboard.</div>
            </div>
            <div style="background:#1f2937;color:#d1d5db;padding:18px;text-align:center;font-size:13px;">SmartVet Professional Platform</div>
        </div>
    `;
    return await sendEmail({
        to: doctor.email,
        subject,
        html
    });
}

async function sendConsultationStartedEmail({ user, doctor, appointment }) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const videoCallUrl = `${baseUrl.replace(/\/$/, '')}/video-call/${appointment._id}`;
    const subject = `🩺 Consultation Started - Dr. ${doctor.name}`;
    const html = `
        <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0ea5e9 0%,#16a34a 100%);padding:32px 24px;text-align:center;color:#fff;">
                <h2 style="margin-bottom:8px;">Consultation Started</h2>
                <div style="font-size:18px;">with Dr. ${doctor.name}</div>
            </div>
            <div style="padding:32px 24px;">
                <p>Dear ${user.name},</p>
                <p>Your consultation for <b>${appointment.petName}</b> has started with Dr. ${doctor.name}.</p>
                <div style="margin:18px 0 24px 0;">
                    <a href="${videoCallUrl}" style="display:inline-block;background:linear-gradient(135deg,#16a34a 0%,#0ea5e9 100%);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:16px;box-shadow:0 2px 8px #05966933;">🔗 Join Video Call</a>
                </div>
                <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin-bottom:18px;">
                    <b>How it works:</b> Just click the link above to join your video call on SmartVet. No Zoom or Google Meet required—everything happens securely on our platform.<br/>
                    If you have any trouble joining, you can also contact your doctor directly:<br/>
                    <b>Email:</b> <a href="mailto:${doctor.email}">${doctor.email}</a><br/>
                    <b>Mobile:</b> <a href="tel:${doctor.mobile}">${doctor.mobile || '-'}</a>
                </div>
            </div>
            <div style="background:#1f2937;color:#d1d5db;padding:18px;text-align:center;font-size:13px;">SmartVet Professional Platform</div>
        </div>
    `;
    return await sendEmail({
        to: user.email,
        subject,
        html
    });
}

async function sendConsultationStartedDoctorEmail({ doctor, user, appointment }) {
    const subject = `🩺 Consultation Started - ${user.name} (${appointment.petName})`;
    const html = `
        <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#16a34a 0%,#0ea5e9 100%);padding:32px 24px;text-align:center;color:#fff;">
                <h2 style="margin-bottom:8px;">Consultation Started</h2>
                <div style="font-size:18px;">with ${user.name} (${appointment.petName})</div>
            </div>
            <div style="padding:32px 24px;">
                <p>Dear Dr. ${doctor.name},</p>
                <p>Your consultation with <b>${user.name}</b> for <b>${appointment.petName}</b> has started.</p>
            </div>
            <div style="background:#1f2937;color:#d1d5db;padding:18px;text-align:center;font-size:13px;">SmartVet Professional Platform</div>
        </div>
    `;
    return await sendEmail({
        to: doctor.email,
        subject,
        html
    });
}

async function sendConsultationCompletedEmail({ user, doctor, appointment, report }) {
    // Payment details
    const payment = appointment.payment || {};
    // Doctor details
    const doctorDetails = `
        <div style="margin-bottom:12px;">
            <b>Dr. ${doctor.name}</b><br/>
            Specialization: ${doctor.specialization || '-'}<br/>
            Email: ${doctor.email}<br/>
            Mobile: ${doctor.mobile || '-'}<br/>
            ${doctor.clinicAddress ? `Clinic: ${doctor.clinicAddress}<br/>` : ''}
        </div>
    `;
    // Prescription summary
    const prescriptionHtml = (report?.prescriptions && report.prescriptions.length > 0)
        ? `<ul style="margin:0 0 12px 0;padding:0 0 0 18px;">
            ${report.prescriptions.map(med => `<li><b>${med.medicineName}</b> - ${med.dosage || ''} ${med.frequency || ''} ${med.duration || ''} ${med.instructions || ''}</li>`).join('')}
          </ul>`
        : '<div style="color:#64748b;">No medicines prescribed.</div>';
    // Payment breakdown (now includes tax)
    const paymentHtml = `
        <table style="width:100%;border-collapse:collapse;margin:18px 0 12px 0;">
            <tr><td style="padding:6px 0;">Consultation Fee:</td><td style="text-align:right;">₹${payment.consultationFee || 0}</td></tr>
            <tr><td style="padding:6px 0;">Platform Fee:</td><td style="text-align:right;">₹${payment.platformFee || 0}</td></tr>
            <tr><td style="padding:6px 0;">Tax (5%):</td><td style="text-align:right;">₹${payment.tax || 0}</td></tr>
            <tr><td style="padding:6px 0;">Total Amount:</td><td style="text-align:right;font-weight:bold;">₹${payment.totalAmount || 0}</td></tr>
        </table>
    `;
    const subject = `Treatment Complete - Your SmartVet Receipt & Report`;
    const html = `
        <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:650px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px #0001;">
          <div style="background:linear-gradient(135deg,#059669 0%,#f59e42 100%);padding:36px 28px;text-align:center;color:#fff;">
            <h2 style="margin-bottom:8px;">Treatment Complete</h2>
            <div style="font-size:20px;">Receipt & Medical Report</div>
          </div>
          <div style="padding:36px 28px;">
            <p style="font-size:16px;">Dear ${user.name},</p>
            <p>Your consultation for <b>${appointment.petName}</b> with Dr. ${doctor.name} is now complete. Here are your treatment details and payment receipt.</p>
            <h3 style="margin:24px 0 8px 0;color:#059669;">Doctor Details</h3>
            ${doctorDetails}
            <h3 style="margin:24px 0 8px 0;color:#059669;">Consultation Summary</h3>
            <div><b>Diagnosis:</b> ${report?.diagnosis || '-'}</div>
            <div><b>Treatment:</b> ${report?.treatment || '-'}</div>
            <div><b>Recommendations:</b> ${report?.recommendations || '-'}</div>
            <div style="margin:12px 0 0 0;"><b>Prescriptions:</b>${prescriptionHtml}</div>
            <h3 style="margin:24px 0 8px 0;color:#059669;">Payment Receipt</h3>
            ${paymentHtml}
            <div style="background:#fef9c3;padding:16px;border-radius:8px;margin:18px 0 0 0;">Thank you for choosing SmartVet! If you have questions, reply to this email or contact support.</div>
          </div>
          <div style="background:#1f2937;color:#d1d5db;padding:20px;text-align:center;font-size:13px;">SmartVet Professional Platform</div>
        </div>
    `;
    return await sendEmail({
        to: user.email,
        subject,
        html
    });
}

async function sendConsultationCompletedDoctorEmail({ doctor, user, appointment, report }) {
    const subject = `📋 Consultation Completed - ${user.name} (${appointment.petName})`;
    const payment = appointment.payment || {};
    const paymentHtml = `
        <table style="width:100%;border-collapse:collapse;margin:18px 0 12px 0;">
            <tr><td style="padding:6px 0;">Consultation Fee:</td><td style="text-align:right;">₹${payment.consultationFee || 0}</td></tr>
            <tr><td style="padding:6px 0;">Platform Fee:</td><td style="text-align:right;">₹${payment.platformFee || 0}</td></tr>
            <tr><td style="padding:6px 0;">Tax (5%):</td><td style="text-align:right;">₹${payment.tax || 0}</td></tr>
            <tr><td style="padding:6px 0;">Total Amount:</td><td style="text-align:right;font-weight:bold;">₹${payment.totalAmount || 0}</td></tr>
        </table>
    `;
    const html = `
        <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#059669 0%,#f59e42 100%);padding:32px 24px;text-align:center;color:#fff;">
                <h2 style="margin-bottom:8px;">Consultation Completed</h2>
                <div style="font-size:18px;">with ${user.name} (${appointment.petName})</div>
            </div>
            <div style="padding:32px 24px;">
                <p>Dear Dr. ${doctor.name},</p>
                <p>Your consultation with <b>${user.name}</b> for <b>${appointment.petName}</b> is now complete.</p>
                <div style="background:#fef9c3;padding:16px;border-radius:8px;margin-bottom:18px;">The medical report has been generated and payment notification sent to the user.</div>
                <h3 style="margin:24px 0 8px 0;color:#059669;">Payment Breakdown</h3>
                ${paymentHtml}
            </div>
            <div style="background:#1f2937;color:#d1d5db;padding:18px;text-align:center;font-size:13px;">SmartVet Professional Platform</div>
        </div>
    `;
    return await sendEmail({
        to: doctor.email,
        subject,
        html
    });
}

module.exports = {
    initializeEmailService,
    generateDoctorAccessLink,
    sendDoctorApprovalEmail,
    sendDoctorRejectionEmail,
    sendDoctorRemovalEmail,
    sendAppointmentBookedEmail,
    sendAppointmentBookedDoctorEmail,
    sendConsultationStartedEmail,
    sendConsultationStartedDoctorEmail,
    sendConsultationCompletedEmail,
    sendConsultationCompletedDoctorEmail,
    sendEmail
};
