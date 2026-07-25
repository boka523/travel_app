require("dotenv").config();
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const HOTELBEDS_BASE_URL = "https://api.test.hotelbeds.com";
const PAGE_SIZE = 1000;
const MAX_REQUESTS_PER_RUN = 10; //mozda smanjit

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

const fetchHotelsPage = async (from, to) => {
  const response = await fetch(
    `${HOTELBEDS_BASE_URL}/hotel-content-api/1.0/hotels?fields=all&language=ENG&from=${from}&to=${to}&useSecondaryLanguage=false`,
    {
      method: "GET",
      headers: getHotelbedsHeaders(),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    console.error("Hotelbeds error:", data);
    throw new Error("Dohvat hotela nije uspio.");
  }
  return data.hotels || [];
};

const getMainImage = (hotel) => {
  if (!hotel.images || hotel.images.length === 0) {
    return null;
  }
  return hotel.images[0].path;
};

const formatHotel = (hotel) => {
  return {
    hotelbedsCode: hotel.code,
    name: hotel.name?.content ?? null,
    countryCode: hotel.countryCode ?? null,
    destinationCode: hotel.destinationCode ?? null,
    address: hotel.address?.content ?? null,
    postalCode: hotel.postalCode?.toString() ?? null,
    city: hotel.city?.content ?? null,
    latitude: hotel.coordinates?.latitude ?? null,
    longitude: hotel.coordinates?.longitude ?? null,
    categoryCode: hotel.categoryCode ?? null,
    description: hotel.description?.content ?? null,
    accommodationTypeCode: hotel.accommodationTypeCode ?? null,
    web: hotel.web ?? null,
    stars: hotel.S2C ? parseInt(hotel.S2C) : null,
    mainImagePath: getMainImage(hotel),
  };
};

const saveHotels = async (hotels) => {
  if (!hotels || hotels.length === 0) {
    return 0;
  }
  const formattedHotels = hotels
    .map(formatHotel)
    .filter(
      (hotel) =>
        hotel.hotelbedsCode !== null &&
        hotel.hotelbedsCode !== undefined &&
        hotel.name,
    ); //filter je tu da ne spremimo hotel bez koda ili imena u bazu podataka
  if (formattedHotels.length === 0) {
    return 0;
  }
  const result = await prisma.hotels.createMany({
    data: formattedHotels,
    skipDuplicates: true,
  });
  return result.count;
};

const getImportProgress = async () => {
  let progress = await prisma.import_progress.findUnique({
    where: {
      importType: "hotels",
    },
  });
  if (!progress) {
    progress = await prisma.import_progress.create({
      data: {
        importType: "hotels",
        nextFrom: 1,
        completed: false,
      },
    });
  }
  return progress;
};

const updateImportProgress = async (nextFrom, completed = false) => {
  return prisma.import_progress.update({
    where: {
      importType: "hotels",
    },
    data: {
      nextFrom,
      completed,
    },
  });
};

const main = async () => {
  const progress = await getImportProgress();
  if (progress.completed) {
    console.log("Import hotela je dovršen.");
    return;
  }
  let from = progress.nextFrom;
  for (
    let requestNumber = 1;
    requestNumber <= MAX_REQUESTS_PER_RUN;
    requestNumber++
  ) {
    const to = from + PAGE_SIZE - 1;
    console.log(
      `Zahtjev ${requestNumber}/${MAX_REQUESTS_PER_RUN}: dohvaćam hotele od ${from} do ${to}...`,
    );
    const hotels = await fetchHotelsPage(from, to);
    if (hotels.length === 0) {
      await updateImportProgress(from, true);
      console.log("Nema više hotela. Import je dovršen.");
      return;
    }
    const savedCount = await saveHotels(hotels);
    const nextFrom = to + 1;
    const importCompleted = hotels.length < PAGE_SIZE;
    await updateImportProgress(nextFrom, importCompleted);
    console.log(
      `API je vratio ${hotels.length} hotela. Spremljeno novih hotela: ${savedCount}`,
    );
    if (importCompleted) {
      console.log("Dohvaćena je zadnja stranica. Import je dovršen.");
      return;
    }
    from = nextFrom;
  }
  console.log(`Dosegnut je dnevni limit od ${MAX_REQUESTS_PER_RUN} zahtjeva.`);
  console.log(`Sljedeći import nastavlja se od pozicije ${from}.`);
};

main()
  .catch((error) => {
    console.error("Greška tijekom importa hotela:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
