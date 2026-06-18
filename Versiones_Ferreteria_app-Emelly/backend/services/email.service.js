import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export const enviarCorreo = async (destino, enlace) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: destino,
    subject: 'Recuperación de contraseña',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Haz clic en el siguiente botón:</p>

      <a href="${enlace}"
         style="
         background:#ffc107;
         color:black;
         padding:12px 20px;
         text-decoration:none;
         border-radius:6px;">
         Restablecer contraseña
      </a>

      <p>Este enlace expirará en 1 hora.</p>
    `
  })
}