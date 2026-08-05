require("dotenv").config();
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
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

const fetchDestinationsPage = async (from, to) => {
  const response = await fetch(
    `${HOTELBEDS_BASE_URL}/hotel-content-api/1.0/locations/destinations?fields=all&language=ENG&from=${from}&to=${to}&useSecondaryLanguage=false`,
    {
      method: "GET",
      headers: getHotelbedsHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Hotelbeds error:", data);
    throw new Error("Failed to fetch destinations.");
  }

  return data.destinations || [];
};

const saveDestinations = async (destinations) => {
  const formattedDestinations = destinations
    .filter((destination) => {
      return destination.code && destination.name?.content;
    })
    .map((destination) => ({
      hotelbedsCode: destination.code,
      name: destination.name.content,
      countryCode: destination.countryCode || null,
    }));

  const skipped = destinations.length - formattedDestinations.length;

  await prisma.destination.createMany({
    data: formattedDestinations,
    skipDuplicates: true,
  });
  console.log(
    `${formattedDestinations.length} destinations successfully saved.`,
  );

  if (skipped > 0) {
    console.log(`${skipped} incorrect destinations skipped.`);
  }
};

const main = async () => {
  const pageSize = 1000;

  try {
    const existingDestinations = await prisma.destination.count();

    let from = existingDestinations + 1;
    let to = from + pageSize - 1;

    console.log(`${existingDestinations} destination already in database.`);
    console.log(`Import continues from destination No.${from}.`);

    while (true) {
      console.log(`Fetching destinations from ${from} to ${to}...`);

      const destinations = await fetchDestinationsPage(from, to);

      console.log(`${destinations.length} destinations fetched.`);

      if (destinations.length === 0) {
        console.log("No more destinations to fetch.");
        break;
      }

      await saveDestinations(destinations);

      if (destinations.length < pageSize) {
        console.log("Fetched the last page.");
        break;
      }

      from = to + 1;
      to = from + pageSize - 1;
    }

    console.log("Destinations import successfully completed.");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
