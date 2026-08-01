require("dotenv").config(); //sluzi da bi se varijable zapisane u .env procitale u pohranile u process.env
const express = require("express"); //server za obradu podataka iz baze
const cors = require("cors"); //tu je da bi backend i frontend mogli komunicirat
const multer = require("multer"); //dodatak na express koji obraduje datoteke, tj. stavia san ga zbog uploada slika
const authenticateToken = require("./middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const duffel = require("./duffel");
const crypto = require("crypto"); //triba nan za sha256 hashiranje, to je ka "tip teksta" koji hotelbeds zahtjeva u svojoj dokumentaciji
const path = require("path"); //ovo nam je za ekstenzije tipa .jpg ili .png

const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const { PrismaClient } = require("@prisma/client");
const { error } = require("console");
const { start } = require("repl");
//const { off } = require("cluster");

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

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); //ovime omogućujemo expressu da posluzuje slike

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

app.get("/trips/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const trip_id = Number(req.params.id);

    if (!Number.isInteger(trip_id) || trip_id < 1) {
      return res.status(400).json({
        error: "Neispravan ID putovanja!",
      });
    }

    const trip = await prisma.trips.findFirst({
      where: {
        id: trip_id,
        user_id: user_id,
      },
      include: {
        hotels: true,
        trip_flights: true,
        trip_car_details: true,
      },
    });

    if (!trip) {
      return res.status(404).json({
        error: "Putovanje nije pronađeno ili ne pripada korisniku!",
      });
    }

    res.status(200).json({
      trip: trip,
    });
  } catch (error) {
    console.error("Greška kod dohvaćanja putovanja:", error);

    res.status(500).json({
      error: "Greška kod dohvaćanja putovanja!",
    });
  }
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

app.get("/airports", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        error: "Unesite barem dva znaka.",
      });
    }

    const response = await fetch(
      `https://api.duffel.com/places/suggestions?query=${encodeURIComponent(city.trim())}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
          "Duffel-Version": "v2",
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();

      return res.status(response.status).json({
        error: "Duffel nije uspio dohvatiti zračne luke.",
        details: errorData,
      });
    }

    const result = await response.json();
    const airports = result.data
      .filter((place) => place.type === "airport")
      .map((place) => ({
        name: place.name,
        code: place.iata_code,
        cityName: place.city_name || null,
        countryCode: place.iata_country_code || null,
      }));
    const filteredAirports = airports.filter(
      (airport) => airport.cityName.toLowerCase() === city.trim().toLowerCase(),
    );

    res.json(filteredAirports);
  } catch (error) {
    console.error("Duffel airports error:", error);

    res.status(500).json({
      error: "Greška pri dohvaćanju aerodroma.",
      details: error.message,
    });
  }
});

app.get("/api/addresses/autocomplete", async (req, res) => {
  const { text, city } = req.query;

  if (!text) {
    return res.status(400).json({
      message: "Missing query parameter 'text'.",
    });
  }

  try {
    const searchText = city ? `${text}, ${city}` : text;

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(searchText)}&limit=10&apiKey=${process.env.GEOAPIFY_API_KEY}`,
    );

    const data = await response.json();

    const suggestions = data.features.map((feature) => ({
      placeId: feature.properties.place_id,
      name: feature.properties.formatted,
      latitude: feature.properties.lat,
      longitude: feature.properties.lon,
      resultType: feature.properties.result_type,
      country: feature.properties.country,
      city: feature.properties.city || null,
    }));

    res.json(suggestions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch addresses.",
    });
  }
});

app.get("/api/here-test", async (req, res) => {
  try {
    const response = await fetch(
      `https://router.hereapi.com/v8/routes?transportMode=car&origin=43.511431,16.449751&destination=45.809159,15.967673&return=summary,tolls&apiKey=${process.env.HERE_API_KEY}`,
    );

    const data = await response.json();

    const section = data.routes?.[0]?.sections?.[0];

    if (!section) {
      return res.status(404).json({
        message: "HERE route not found.",
      });
    }

    const tolls = section.tolls || [];

    const tollDetails = tolls.flatMap((toll) =>
      (toll.fares || []).map((fare) => ({
        countryCode: toll.countryCode,
        tollSystem: fare.name || null,
        reason: fare.reason || null,
        price: fare.price?.value || 0,
        currency: fare.price?.currency || "EUR",
        paymentMethods: fare.paymentMethods || [],
        collectionLocations: (fare.tollCollectionLocations || []).map(
          (location) => ({
            name: location.name,
            latitude: location.location?.lat,
            longitude: location.location?.lng,
          }),
        ),
      })),
    );

    const totalTollCost = tollDetails.reduce(
      (total, toll) => total + toll.price,
      0,
    );

    res.json({
      totalTollCost: Number(totalTollCost.toFixed(2)),
      currency: tollDetails[0]?.currency || "EUR",
      tollDetails,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "HERE request failed." });
  }
});

//za AI
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, trip, messages } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    if (message.length > 300) {
      return res.status(400).json({
        error: "Message is too long.",
      });
    }

    if (!trip) {
      return res.status(400).json({
        error: "Trip data is required.",
      });
    }

    const previousMessages = Array.isArray(messages)
      ? messages
          .filter(
            (chatMessage) =>
              chatMessage.role === "user" || chatMessage.role === "assistant",
          )
          .slice(-10)
      : [];

    const {
      departure,
      destination,
      startDate,
      endDate,
      passengers_num,
      transport_type,
    } = trip;

    if (!departure || !departure.trim()) {
      return res.status(400).json({
        error: "Trip departure is required.",
      });
    }

    if (!destination || !destination.trim()) {
      return res.status(400).json({
        error: "Trip destination is required.",
      });
    }

    const passengerCount = Number(passengers_num) || 1;

    const tripContext = `
    Trip departure: ${departure.trim()}
    Trip destination: ${destination.trim()}
    Trip start date: ${startDate || "not provided"}
    Trip end date: ${endDate || "not provided"}
    Number of travelers: ${passengerCount}
    Transport type: ${transport_type || "not provided"}
    Preferred currency: EUR`.trim();

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      reasoning: {
        effort: "minimal",
      },
      input: [
        {
          role: "developer",
          content:
            `You are WayAway AI, a concise travel cost estimation assistant.
            Trip information: ${tripContext} .
            Always respond in English. 
            Give realistic approximate price ranges. 
            Use the trip information when it is relevant to the user's question. 
            Use additional details provided by the user. 
            If important details are missing, make simple conservative assumptions and state them briefly. 
            Do not assume luxury meals, multiple courses, alcohol, or extra services unless the user mentions them. 
            Keep the answer under 70 words.`.trim(),
        },
        ...previousMessages,
        {
          role: "user",
          content: message.trim(),
        },
      ],
      max_output_tokens: 200,
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI request failed.",
    });
  }
});

app.post("/api/car-route", async (req, res) => {
  const { start, destination } = req.body;

  if (
    !start?.latitude ||
    !start?.longitude ||
    !destination?.latitude ||
    !destination?.longitude
  ) {
    return res.status(400).json({
      message: "Missing coordinates.",
    });
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${start.latitude},${start.longitude}|${destination.latitude},${destination.longitude}&mode=drive&apiKey=${process.env.GEOAPIFY_API_KEY}`,
    );

    const data = await response.json();

    const route = data.features?.[0];

    if (!route) {
      return res.status(404).json({
        message: "Route not found.",
      });
    }

    const distanceMeters = route.properties.distance;
    const durationSeconds = route.properties.time;

    const hereResponse = await fetch(
      `https://router.hereapi.com/v8/routes?transportMode=car&origin=${start.latitude},${start.longitude}&destination=${destination.latitude},${destination.longitude}&return=summary,tolls&currency=EUR&apiKey=${process.env.HERE_API_KEY}`,
    );
    const hereData = await hereResponse.json();

    if (!hereResponse.ok) {
      console.error("HERE error:", hereData);
      throw new Error("Failed to calculate toll costs.");
    }

    const hereSections = hereData.routes?.[0]?.sections || [];

    const tollDetails = hereSections.flatMap((section) =>
      (section.tolls || []).flatMap((toll) =>
        (toll.fares || [])
          .filter((fare) => !fare.pass)
          .map((fare) => ({
            countryCode: toll.countryCode || null,
            tollSystem: toll.tollSystem || fare.name || null,
            reason: fare.reason || null,
            price: Number(fare.price?.value || 0),
            currency: fare.price?.currency || "EUR",
            paymentMethods: fare.paymentMethods || [],
            collectionLocations: (toll.tollCollectionLocations || []).map(
              (location) => ({
                name: location.name || null,
                latitude: location.location?.lat || null,
                longitude: location.location?.lng || null,
              }),
            ),
          })),
      ),
    );

    const totalTollCost = tollDetails.reduce(
      (total, detail) => total + detail.price,
      0,
    );

    res.json({
      start,
      destination,

      distanceMeters,
      distanceKm: Number((distanceMeters / 1000).toFixed(2)),

      durationSeconds,
      durationMinutes: Number((durationSeconds / 60).toFixed(2)),
      durationHours: Number((durationSeconds / 3600).toFixed(2)),

      toll: route.properties.toll || false,
      tollCost: {
        total: Number(totalTollCost.toFixed(2)),
        currency: tollDetails[0]?.currency || "EUR",
        details: tollDetails,
      },
      geometry: route.geometry,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to calculate route.",
    });
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

    const avaliableHotels = data.hotels?.hotels || [];
    const hotelbedsCode = avaliableHotels.map((hotel) => Number(hotel.code));

    const localHotels = await prisma.hotels.findMany({
      where: {
        hotelbedsCode: {
          in: hotelbedsCode,
        },
      },
      select: {
        id: true,
        hotelbedsCode: true,
        name: true,
        address: true,
        mainImagePath: true,
        stars: true,
      },
    });

    const localHotelsByCode = new Map(
      localHotels.map((hotel) => [hotel.hotelbedsCode, hotel]),
    );

    const accommodations = avaliableHotels
      .map((hotel) => {
        const localHotel = localHotelsByCode.get(Number(hotel.code));

        if (!localHotel) {
          return null;
        }

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
        const totalPrice = (price + taxAmount).toFixed(2);

        return {
          id: localHotel.id,
          hotelbedsCode: Number(hotel.code),
          name: localHotel.name || hotel.name,
          address: localHotel.address,
          photo: localHotel.mainImagePath
            ? `https://photos.hotelbeds.com/giata/bigger/${localHotel.mainImagePath}`
            : null,
          price,
          currency: data.hotels?.currency || "EUR",
          allotment: firstRate.allotment ?? null,
          boardName: firstRate?.boardName
            ? firstRate.boardName
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : null,
          rateKey: firstRate?.rateKey || null, //jedinstveni identifikator ponude; u njemu su kodirani datumi dolaska i odlaska, hotela i sobe, broja gostiju...
          packaging: firstRate.packaging,
          taxAmount,
          taxesIncluded: excludedTaxes.length === 0,
          totalPrice,
          stars: localHotel.stars,
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

app.post("/search-flights", async (req, res) => {
  const {
    departureAirport,
    arrivalAirport,
    departureDate,
    returnDate,
    passengers,
  } = req.body;

  try {
    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin: departureAirport,
          destination: arrivalAirport,
          departure_date: departureDate,
        },
        {
          origin: arrivalAirport,
          destination: departureAirport,
          departure_date: returnDate,
        },
      ],
      passengers: Array.from({ length: Number(passengers) }, () => ({
        type: "adult",
      })),
      cabin_class: "economy",
    });

    const formattedOffers = offerRequest.data.offers.map((offer) => {
      const outboundSlice = offer.slices[0];
      const returnSlice = offer.slices[1];

      return {
        offerId: offer.id,
        airlineName: offer.owner.name,
        airlineCode: offer.owner.iata_code,
        price: offer.total_amount,
        currency: offer.total_currency,
        outbound: {
          departureAirport: outboundSlice.origin.iata_code,
          arrivalAirport: outboundSlice.destination.iata_code,
          departureTime: outboundSlice.segments[0].departing_at,
          arrivalTime:
            outboundSlice.segments[outboundSlice.segments.length - 1]
              .arriving_at,
          duration: outboundSlice.duration,
          stops: outboundSlice.segments.length - 1,
          segments: outboundSlice.segments.map((segment) => ({
            flightNumber: `${segment.marketing_carrier.iata_code}${segment.marketing_carrier_flight_number}`,
            departureAirport: segment.origin.iata_code,
            arrivalAirport: segment.destination.iata_code,
            departureTime: segment.departing_at,
            arrivalTime: segment.arriving_at,
            aircraft: segment.aircraft?.name || null,
          })),
        },
        return: {
          departureAirport: returnSlice.origin.iata_code,
          arrivalAirport: returnSlice.destination.iata_code,
          departureTime: returnSlice.segments[0].departing_at,
          arrivalTime:
            returnSlice.segments[returnSlice.segments.length - 1].arriving_at,
          duration: returnSlice.duration,
          stops: returnSlice.segments.length - 1,
          segments: returnSlice.segments.map((segment) => ({
            flightNumber: `${segment.marketing_carrier.iata_code}${segment.marketing_carrier_flight_number}`,
            departureAirport: segment.origin.iata_code,
            arrivalAirport: segment.destination.iata_code,
            departureTime: segment.departing_at,
            arrivalTime: segment.arriving_at,
            aircraft: segment.aircraft?.name || null,
          })),
        },
      };
    });
    res.json(formattedOffers);
  } catch (error) {
    console.error("Duffel error:", error);

    res.status(500).json({
      error: "Greška pri dohvaćanju letova.",
      details: error.message,
    });
  }
});

app.post("/trips", authenticateToken, async (req, res) => {
  const {
    destination,
    start_date,
    end_date,
    transport_type,
    passengers_num,
    hotel_id,
    hotel_price,
    hotel_currency,
    hotel_board_name,
    selectedFlight,
    carDetails,
    ai_cost,
  } = req.body;

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

  if (!["plane", "car"].includes(transport_type)) {
    return res.status(400).json({ error: "Nepoznat tip prijevoza!" });
  }

  try {
    let selectedHotel = null;

    if (hotel_id !== null && hotel_id !== undefined) {
      selectedHotel = await prisma.hotels.findUnique({
        where: {
          id: Number(hotel_id),
        },
      });

      if (!selectedHotel) {
        return res.status(404).json({
          error: "Odabrani hotel nije pronađen!",
        });
      }
    }

    const trip = await prisma.trips.create({
      data: {
        user_id: req.user.id,
        destination,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        transport_type,
        passengers_num,
        hotel_id: selectedHotel ? selectedHotel.id : null,
        hotel_price: selectedHotel ? hotel_price : null,
        hotel_currency: selectedHotel ? hotel_currency : null,
        hotel_board_name: selectedHotel ? hotel_board_name : null,
        ai_cost:
          ai_cost !== null && ai_cost !== undefined ? Number(ai_cost) : null,
      },
    });

    if (
      (transport_type === "plane" || transport_type === "aeroplane") &&
      selectedFlight
    ) {
      await prisma.trip_flights.create({
        data: {
          trip_id: trip.id,
          airline_name: selectedFlight.airlineName || null,
          airline_code: selectedFlight.airlineCode || null,
          outbound_departure_time: selectedFlight.outbound?.departureTime
            ? new Date(selectedFlight.outbound.departureTime)
            : null,
          outbound_arrival_time: selectedFlight.outbound?.arrivalTime
            ? new Date(selectedFlight.outbound.arrivalTime)
            : null,
          return_departure_time: selectedFlight.return?.departureTime
            ? new Date(selectedFlight.return.departureTime)
            : null,
          return_arrival_time: selectedFlight.return?.arrivalTime
            ? new Date(selectedFlight.return.arrivalTime)
            : null,
          stops:
            Number(selectedFlight.outbound?.stops || 0) +
            Number(selectedFlight.return?.stops || 0),
          price: Number(selectedFlight.price),
          currency: selectedFlight.currency || "EUR",
          provider_offer_id: selectedFlight.offerId || null,
          provider: "Duffel",
        },
      });
    }

    if ((transport_type === "car" || transport_type === "auto") && carDetails) {
      await prisma.trip_car_details.create({
        data: {
          trip_id: trip.id,
          distance_km: Number(carDetails.distanceKm),
          duration_seconds: Number(carDetails.durationSeconds),

          fuel_type: carDetails.fuelType || null,
          fuel_consumption: Number(carDetails.fuelConsumption),
          fuel_price: Number(carDetails.fuelPrice),
          fuel_cost: Number(carDetails.fuelCost),

          toll_cost: Number(carDetails.tollCost || 0),
        },
      });
    }

    res.status(201).json(trip);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Greška kod stvaranja putovanja" });
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

  if (!["plane", "car"].includes(transport_type)) {
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
      if (["plane", "car"].includes(transport_type)) {
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

app.patch("/profile", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, email } = req.body;

    if (
      (name === undefined || name.trim() === "") &&
      (email === undefined || email.trim() === "")
    ) {
      return res.status(400).json({
        error: "Niste unijeli podatke za promjenu!",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Korisnik nije pronađen!",
      });
    }

    const updatedData = {};

    if (name !== undefined && name.trim() !== "") {
      updatedData.name = name.trim();
    }

    if (email !== undefined && email.trim() !== "") {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await prisma.users.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (existingUser && existingUser.id !== user_id) {
        return res.status(409).json({
          error: "Korisnik s tom email adresom već postoji!",
        });
      }

      updatedData.email = normalizedEmail;
    }

    const updatedUser = await prisma.users.update({
      where: {
        id: user_id,
      },
      data: updatedData,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    return res.status(200).json({
      message: "Podaci su uspješno promijenjeni!",
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Greška kod promjene korisničkih podataka.",
    });
  }
});

app.listen(5000, () => {
  console.log("Server radi na http://localhost:5000");
});
