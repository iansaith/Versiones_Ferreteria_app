import jsonServer from "json-server";
import { Buffer } from "buffer"; // 👈 SOLUCIÓN para Buffer

const server = jsonServer.create();

const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// 🔐 LOGIN → genera OTP


server.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get("users").find({ email, password }).value();
  
  if (!user) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  db.get("users")
    .find({ id: user.id })
    .assign({ otp })
    .write();

  console.log("OTP generado:", otp);

  res.json({
    message: "OTP enviado",
    userId: user.id
  });
});

// 🔑 VERIFY OTP
server.post("/verify-otp", (req, res) => {
  const { userId, otp } = req.body;
  const db = router.db;

  const user = db.get("users").find({ id: userId }).value();

  if (!user || user.otp !== otp) {
    return res.status(401).json({ message: "OTP inválido" });
  }

  const payload = {
    id: user.id,
    username: user.username
  };

  const token =
    "fakeHeader." +
    Buffer.from(JSON.stringify(payload)).toString("base64") +
    ".fakeSignature";

  db.get("users")
    .find({ id: user.id })
    .assign({ otp: null })
    .write();

  res.json({
    message: "Autenticado",
    token
  });
});

server.use(router);

server.listen(3005, () => {
  console.log("Servidor corriendo en http://localhost:3005 ");
});