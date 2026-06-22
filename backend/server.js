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
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Greška kod dohvaćanja korisnika" });
  }
});

app.get("/my_trips", authenticateToken, async (req, res) => {
  try {
    const trips = await prisma.trips.findMany({
      where: {
        user_id: req.user.id
      }
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Greška kod dohvaćanja putovanja" });
  }
});

app.get("/me", authenticateToken, async (req, res) => {
  try{
    const user=await prisma.users.findUnique({
      where:{
        id:req.user.id
      },
      select:{
        id:true,
        name:true,
        email:true
      }});
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Greška kod dohvaćanja korisnika" });
  }
});

app.post("/trips", authenticateToken, async (req, res) => {
  const {destination, start_date, end_date, transport_type, passengers_num } = req.body;
  if(Object.keys(req.body).length !== 5){
    return res.status(400).json({error: "Nisu uneseni svi podaci za putovanje!"});
  }
  try {
    const trip = await prisma.trips.create({
      data: {
        user_id: req.user.id,
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
  if(Object.keys(req.body).length !== 3){
    return res.status(400).json({error: "Nisu uneseni svi podaci za registraciju!"});
  }
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
    const token = jwt.sign(
      {
        id:user.id,
        email:user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    )
    res.status(201).json({
      message: "Uspješna registracija", 
      token, 
      user: {
        id:user.id, 
        name:user.name, 
        email:user.email}});
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: "Greška kod registracije korisnika" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if(Object.keys(req.body).length !== 2){
    return res.status(400).json({error: "Nisu uneseni svi podaci za prijavu!"});
  }
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

app.delete("/trips/:id", authenticateToken, async (req, res) => {
  try {
    const user_id=req.user.id;
    const trip_id=Number(req.params.id);
    const trip = await prisma.trips.findFirst({
      where:{
        user_id,
        id:trip_id
      }
    });
    if (!trip) {
      return res.status(404).json({ error: "Putovanje nije pronađeno ili ne pripada korisniku!" });
    }
    await prisma.trips.delete({
    where:{
      id:trip_id
    }})
  res.status(200).json({message: "Putovanje uspješno obrisano!"})
  } catch (error) {
    res.status(500).json({ error: "Greška kod brisanja putovanja" });
  }
});

app.put("/trips/:id", authenticateToken, async (req, res) => {
  try {
    const user_id=req.user.id;
    const trip_id=Number(req.params.id);
    const {destination, start_date, end_date,  transport_type, passengers_num}=req.body;
    const trip = await prisma.trips.findFirst({
      where:{
        user_id,
        id:trip_id
      }
    });
    if (!trip) {
        return res.status(404).json({ error: "Putovanje nije pronađeno ili ne pripada korisniku!" });
      }
    const updatedTrip = {
      destination:destination,
      start_date:new Date(start_date),
      end_date:new Date(end_date),
      transport_type:transport_type,
      passengers_num:passengers_num
    }
    await prisma.trips.update({
      where:{
        id:trip_id
      },
      data:updatedTrip
    })
    res.status(200).json({
      message:"Detalji putovanja uspješno promijenjeni!",
      trip: updatedTrip
    })
  } catch (error) {
    res.status(500).json({ error: "Greška kod ažuriranja putovanja" });
  }
})

app.patch("/trips/:id", authenticateToken, async (req, res) => {
  try{
    const user_id=req.user.id;
    const trip_id=Number(req.params.id);
    const {destination, start_date, end_date,  transport_type, passengers_num}=req.body;
    const trip = await prisma.trips.findFirst({
      where:{
        user_id,
        id:trip_id
      }
    });
    if (!trip) {
        return res.status(404).json({ error: "Putovanje nije pronađeno ili ne pripada korisniku!" });
      }
    const data ={}
    if (destination !== undefined) {
      data.destination = destination;
    }
    if (start_date !== undefined) {
      data.start_date = new Date(start_date);
    }
    if (end_date !== undefined) {
      data.end_date = new Date(end_date);
    }
    if (transport_type !== undefined) {
      data.transport_type = transport_type;
    }
    if (passengers_num !== undefined) {
      data.passengers_num = passengers_num;
    }
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Nema podataka za ažuriranje!" });
    }
    const updatedTrip = await prisma.trips.update({
      where:{
        id:trip_id
      },
      data: data
    })
    res.status(200).json({
      message:"Detalji putovanja uspješno promijenjeni!",
      trip: updatedTrip
    })
  } catch (error) {
    res.status(500).json({ error: "Greška kod ažuriranja putovanja" });
  }
})

app.listen(5000, () => {
  console.log("Server radi na http://localhost:5000");
});