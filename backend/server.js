const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/auth");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bogu fala Backend radi");
});

app.get("/trips", async (req, res) => {
  try {
    const trips = await prisma.trips.findMany();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Greška kod dohvaćanja putovanja" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Greška kod dohvaćanja korisnika" });
  }
});

app.post("/trips", async (req, res) => {
  const { user_id,destination, start_date, end_date, transport_type, passengers_num } = req.body;
  try {
    const trip = await prisma.trips.create({
      data: {
        user_id,
        destination,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        transport_type, 
        passengers_num
      }
    });
    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod stvaranja putovanja" });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try{
    const existingUser = await prisma.users.findUnique({
      where: {
        email
      }
    });
    if(existingUser){
      return res.status(409).json({ error: "Korisnik s ovim emailom već postoji - prijavite se!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data:{
        email,
        name,
        password_hash: hashedPassword
      }
    });
    res.status(201).json(user);
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: "Greška kod registracije korisnika" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.users.findUnique({
      where: {
        email
      }
    });
    if (!user) {
      return res.status(404).json({ error: "Korisnik nije pronađen" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Pogrešna lozinka" });
    }

    const token = jwt.sign(
    {
      id:user.id,
      email:user.email
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: "1h" 
    });

    res.status(200).json({
      message: "Uspješna prijava",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod prijave korisnika" });
  }
});

app.listen(5000, () => {
  console.log("Server radi na http://localhost:5000");
});