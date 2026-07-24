require("dotenv").config(); //sluzi da bi se varijable zapisane u .env procitale u pohranile u process.env
const express = require("express"); //server za obradu podataka iz baze
const cors = require("cors"); //tu je da bi backend i frontend mogli komunicirat
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); //triba nan za sha256 hashiranje, to je ka "tip teksta" koji hotelbeds zahtjeva u svojoj dokumentaciji
//const axios = require("axios"); // sluzi za slanje http zahtjeva
const multer = require("multer"); //dodatak na express koji obraduje datoteke, tj. stavia san ga zbog uploada slika
const path = require("path"); //ovo nam je za ekstenzije tipa .jpg ili .png
const authenticateToken = require("./middleware/auth");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const HOTELBEDS_BASE_URL = "https://api.test.hotelbeds.com";

const createHotelbedsSignature = () => {
  const apiKey = process.env.HOTELBEDS_API_KEY;
  const secret = process.env.HOTELBEDS_SECRET;
  const timeStamp = Math.floor(Date.now() / 1000); //vrijeme u milisekundama koje je proslo od 1.1.1970. do sad pa dijeljeno 1000 da bude u sekundama i zaokruzeno jer to hotelbeds zahtjeva

  return crypto
    .createHash("sha256") //napravi SHA256 algoritam
    .update(apiKey + secret + timeStamp) //spoji ovo troje (hotelbeds to zahtjeva)
    .digest("hex"); //pretvori u heksadekadski (isto zahtjev hotelbedsa)
};

const getHotelbedsHeaders = () => {
  return {
    "Api-key": process.env.HOTELBEDS_API_KEY,
    "X-Signature": createHotelbedsSignature(),
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};
//storage govori gdje i pod kojim imenom spremiti sliku
const storage = multer.diskStorage({
  //"spremi datoteku na fizicki disk, tj. backend"
  destination: (req, file, cb) => {
    //parametri su request, slika koju je korisnik posla i callback (govori di triba spremit datoteku ili jel sve okej)
    cb(null, "uploads/profile-images"); //"nema greske, datoteku spremi u backend/uploads/profile-images"
  },
  filename: (req, file, cb) => {
    //odreduje ime spremljene slike
    const uniqueName = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`; //file.originalname je npr. slika.png, a path.extname uzima samo .png
    cb(null, uniqueName); //"nema greske, datoteku spremi pod ovim imenom"
  },
});

//upload govori kako multer smije prihvatiti datoteku
const upload = multer({
  storage, //"kad primis datoteku, koristi storage konfiguraciju od iznad"
  limits: {
    fileSize: 5 * 1024 * 1024, //ogranicava datoteku na velicinu od 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      //mimetypes su image/jpeg, image/png, image/webp... "ako pocinje sa image/, nema greske, spremi je"
      cb(null, true);
    } else {
      cb(new Error("Možete učitati samo sliku!"));
    }
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); //ovime omogućujemo expressu da posluzuje slike

app.get("/", (req, res) => {
  res.send("Bogu fala Backend radi");
});

//samo da vidin koje su mi sve destinacije dostupne
app.get("/api/destinations", async (req, res) => {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
      },
    });
    res.json(destinations.map((destination) => destination.name));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška pri dohvaćanju destinacija." });
  }
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
      },
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
        user_id: req.user.id,
      },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Greška kod dohvaćanja putovanja" });
  }
});

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile_image: true,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Greška kod dohvaćanja korisnika" });
  }
});

app.post("/trips", authenticateToken, async (req, res) => {
  const { destination, start_date, end_date, transport_type, passengers_num } =
    req.body;
  if (Object.keys(req.body).length !== 5) {
    return res
      .status(400)
      .json({ error: "Nisu uneseni svi podaci za putovanje!" });
  }
  if (
    destination === "" ||
    start_date === "" ||
    end_date === "" ||
    transport_type === ""
  ) {
    return res
      .status(400)
      .json({ error: "Neki od podataka za putovanje je prazan!" });
  }
  if (new Date(start_date) > new Date(end_date)) {
    return res.status(400).json({
      error: "Datum početka putovanja ne može biti nakon datuma završetka!",
    });
  }
  if (passengers_num < 1) {
    return res.status(400).json({ error: "Broj putnika mora biti veći od 0!" });
  }
  if (!["plane", "train", "bus", "car", "boat"].includes(transport_type)) {
    return res.status(400).json({ error: "Nepoznat tip prijevoza!" });
  }
  try {
    const trip = await prisma.trips.create({
      data: {
        user_id: req.user.id,
        destination,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        transport_type,
        passengers_num,
      },
    });
    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod stvaranja putovanja" });
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (Object.keys(req.body).length !== 3) {
    return res
      .status(400)
      .json({ error: "Nisu uneseni svi podaci za registraciju!" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Neispravan format email adrese!",
    });
  }
  try {
    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Korisnik s ovim emailom već postoji - prijavite se!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        email,
        name,
        password_hash: hashedPassword,
      },
    });
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    res.status(201).json({
      message: "Uspješna registracija",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod registracije korisnika" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (Object.keys(req.body).length !== 2) {
    return res
      .status(400)
      .json({ error: "Nisu uneseni svi podaci za prijavu!" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Neispravan format email adrese!",
    });
  }
  try {
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
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
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.status(200).json({
      message: "Uspješna prijava",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod prijave korisnika" });
  }
});

app.post("/change_password", authenticateToken, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const user_id = req.user.id;
    const user = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Korisnik nije pronađen!" });
    }
    if (old_password !== undefined && old_password !== "") {
      if (new_password !== undefined && new_password !== "") {
        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isMatch) {
          return res
            .status(400)
            .json({ error: "Stara lozinka nije ispravna!" });
        } else {
          if (new_password === old_password) {
            return res
              .status(400)
              .json({ error: "Nova lozinka je ista kao stara!" });
          }
          const new_password_hash = await bcrypt.hash(new_password, 10);
          await prisma.users.update({
            where: {
              id: user_id,
            },
            data: {
              password_hash: new_password_hash,
            },
          });
          res
            .status(200)
            .json({ message: "Uspješno ste promijenili lozinku!" });
        }
      } else {
        res.status(400).json({ error: "Niste unijeli novu lozinku!" });
      }
    } else {
      res.status(400).json({ error: "Niste unijeli staru lozinku!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Greška kod promjene lozinke" });
  }
});

app.delete("/trips/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const trip_id = Number(req.params.id);
    const trip = await prisma.trips.findFirst({
      where: {
        user_id,
        id: trip_id,
      },
    });
    if (!trip) {
      return res
        .status(404)
        .json({ error: "Putovanje nije pronađeno ili ne pripada korisniku!" });
    }
    const deletedTrip = await prisma.trips.delete({
      where: {
        id: trip_id,
      },
    });
    res.status(200).json({
      message: "Putovanje uspješno obrisano!",
      trip: deletedTrip,
    });
  } catch (error) {
    res.status(500).json({ error: "Greška kod brisanja putovanja" });
  }
});

app.put("/trips/:id", authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const trip_id = Number(req.params.id);
  const { destination, start_date, end_date, transport_type, passengers_num } =
    req.body;
  if (Object.keys(req.body).length !== 5) {
    return res
      .status(400)
      .json({ error: "Nisu uneseni svi podaci za putovanje!" });
  }
  if (
    destination === "" ||
    start_date === "" ||
    end_date === "" ||
    transport_type === ""
  ) {
    return res
      .status(400)
      .json({ error: "Neki od podataka za putovanje je prazan!" });
  }
  if (new Date(start_date) > new Date(end_date)) {
    return res.status(400).json({
      error: "Datum početka putovanja ne može biti nakon datuma završetka!",
    });
  }
  if (passengers_num < 1) {
    return res.status(400).json({ error: "Broj putnika mora biti veći od 0!" });
  }
  if (!["plane", "train", "bus", "car", "boat"].includes(transport_type)) {
    return res.status(400).json({ error: "Nepoznat tip prijevoza!" });
  }
  try {
    const trip = await prisma.trips.findFirst({
      where: {
        user_id,
        id: trip_id,
      },
    });
    if (!trip) {
      return res
        .status(404)
        .json({ error: "Putovanje nije pronađeno ili ne pripada korisniku!" });
    }
    const updatedTrip = {
      destination,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      transport_type,
      passengers_num,
    };
    await prisma.trips.update({
      where: {
        id: trip_id,
      },
      data: updatedTrip,
    });
    res.status(200).json({
      message: "Detalji putovanja uspješno promijenjeni!",
      trip: updatedTrip,
    });
  } catch (error) {
    res.status(500).json({ error: "Greška kod ažuriranja putovanja" });
  }
});

app.patch("/trips/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const trip_id = Number(req.params.id);
    const {
      destination,
      start_date,
      end_date,
      transport_type,
      passengers_num,
    } = req.body;
    const trip = await prisma.trips.findFirst({
      where: {
        user_id,
        id: trip_id,
      },
    });
    if (!trip) {
      return res
        .status(404)
        .json({ error: "Putovanje nije pronađeno ili ne pripada korisniku!" });
    }
    const data = {};
    if (destination !== undefined) {
      if (destination !== "") {
        data.destination = destination;
      } else {
        return res
          .status(400)
          .json({ error: "Destination ne smije biti prazan!" });
      }
    }
    if (start_date !== undefined) {
      if (start_date !== "") {
        data.start_date = new Date(start_date);
      } else {
        return res
          .status(400)
          .json({ error: "Start date ne smije biti prazan!" });
      }
    }
    if (end_date !== undefined) {
      if (end_date !== "") {
        data.end_date = new Date(end_date);
      } else {
        return res
          .status(400)
          .json({ error: "End date ne smije biti prazan!" });
      }
    }
    if (transport_type !== undefined) {
      if (["plane", "train", "bus", "car", "boat"].includes(transport_type)) {
        data.transport_type = transport_type;
      } else {
        return res.status(400).json({ error: "Nepoznat tip prijevoza!" });
      }
    }
    if (passengers_num !== undefined) {
      if (passengers_num !== "" && passengers_num >= 1) {
        data.passengers_num = passengers_num;
      } else {
        return res
          .status(400)
          .json({ error: "Broj putnika mora biti veći od 0!" });
      }
    }
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Nema podataka za ažuriranje!" });
    }
    const finalStartDate = data.start_date ?? new Date(trip.start_date);
    const finalEndDate = data.end_date ?? new Date(trip.end_date);
    if (finalStartDate > finalEndDate) {
      return res
        .status(400)
        .json({ error: "Start date ne može biti nakon end date!" });
    }
    const updatedTrip = await prisma.trips.update({
      where: {
        id: trip_id,
      },
      data: data,
    });
    res.status(200).json({
      message: "Detalji putovanja uspješno promijenjeni!",
      trip: updatedTrip,
    });
  } catch (error) {
    res.status(500).json({ error: "Greška kod ažuriranja putovanja" });
  }
});

app.post("/api/accommodations", async (req, res) => {
  try {
    const { destination, checkin, checkout, adults } = req.body;

    if (!destination || !checkin || !checkout || !adults) {
      return res.status(400).json({
        message: "Nedostaju podaci za pretragu smještaja.",
      });
    }

    const foundDestination = await prisma.destination.findFirst({
      where: {
        name: {
          contains: destination.trim(),
        },
      },
    });

    if (!foundDestination) {
      return res.status(400).json({
        message: "Upisana destinacija trenutno nije dostupna.",
      });
    }

    const destinationCode = foundDestination.hotelbedsCode;

    const hotelbedsRequestBody = {
      stay: {
        checkIn: checkin,
        checkOut: checkout,
      },
      occupancies: [
        {
          rooms: 1,
          adults: Number(adults),
          children: 0,
        },
      ],
      destination: {
        code: destinationCode,
      },
    };

    const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/hotels`, {
      method: "POST",
      headers: getHotelbedsHeaders(),
      body: JSON.stringify(hotelbedsRequestBody),
    });

    const data = await response.json();
    //ovo su svi hoteli dostupni
    //console.log(JSON.stringify(data, null, 2));
    if (!response.ok) {
      console.error("Hotelbeds availability error:", data);
      return res.status(response.status).json({
        message: "Pretraga smještaja nije uspjela",
        details: data,
      });
    }
    console.log("Hotelbeds odgovor:", data);

    const accommodations = (data.hotels?.hotels || [])
      .map((hotel) => {
        const allRates = hotel.rooms?.flatMap((room) => room.rates || []) || [];
        const firstRate = allRates.find((rate) => rate.packaging === false);
        if (!firstRate) {
          return null;
        }
        const excludedTaxes =
          firstRate.taxes?.taxes?.filter((tax) => tax.included === false) || [];
        const taxAmount = excludedTaxes.reduce(
          (total, tax) => total + Number(tax.amount || 0),
          0,
        );
        const price = Number(firstRate.net || 0);
        const totalPrice = price + taxAmount;

        return {
          id: hotel.code,
          name: hotel.name,
          price,
          currency: data.hotels?.currency || "EUR",
          allotment: firstRate.allotment ?? null,
          boardName: firstRate?.boardName || null,
          rateKey: firstRate?.rateKey || null, //jedinstveni identifikator ponude; u njemu su kodirani datumi dolaska i odlaska, hotela i sobe, broja gostiju...
          packaging: firstRate.packaging,
          taxAmount,
          taxesIncluded: excludedTaxes.length === 0,
          totalPrice,
        };
      })
      .filter((hotel) => hotel !== null);

    return res.status(200).json({
      message: "Smještaji su uspješno dohvaćeni.",
      recievedData: {
        destination,
        checkin,
        checkout,
        adults,
      },
      accommodations,
    });
  } catch (error) {
    console.error("Accomodation search error:", error);
    return res.status(500).json({
      message: "Došlo je do greške prilikom pretrage smještaja",
    });
  }
});

app.post(
  "/profile-picture",
  authenticateToken,
  upload.single("profile_image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Slika nije odabrana",
        });
      }
      const profileImage = `/uploads/profile-images/${req.file.filename}`;
      await prisma.users.update({
        where: {
          id: req.user.id,
        },
        data: {
          profile_image: profileImage,
        },
      });
      res.status(200).json({
        message: "Profilna slika uspješno promijenjena.",
        profile_image: profileImage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Greška kod spremanja profilne slike.",
      });
    }
  },
);

app.listen(5000, () => {
  console.log("Server radi na http://localhost:5000");
});
