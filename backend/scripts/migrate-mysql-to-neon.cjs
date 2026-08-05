require("dotenv").config();

const mysql = require("mysql2/promise");
const { Pool } = require("pg");

const MYSQL_DATABASE_URL = process.env.MYSQL_DATABASE_URL;
const DATABASE_URL = process.env.DATABASE_URL;

if (!MYSQL_DATABASE_URL) {
  throw new Error("MYSQL_DATABASE_URL is not in .env file.");
}

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not in .env file.");
}

const mysqlUrl = new URL(MYSQL_DATABASE_URL);
const postgresUrl = new URL(DATABASE_URL);

// Zaštita da slučajno ne čitamo iz pogrešne MySQL baze.
if (mysqlUrl.pathname.replace("/", "") !== "travel_app") {
  throw new Error(
    `Expected MySQL database is "travel_app", but URL points to "${mysqlUrl.pathname.replace(
      "/",
      "",
    )}".`,
  );
}

// Zaštita da se podaci šalju na Neon, a ne na neku drugu PostgreSQL bazu.
if (!postgresUrl.hostname.includes("neon.tech")) {
  throw new Error(
    "DATABASE_URL is not looking like Neon URL. Stopping for safety reasons.",
  );
}

const mysqlConnection = mysql.createPool({
  uri: MYSQL_DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  dateStrings: false,
});

const postgresPool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const TABLES = [
  "users",
  "destination",
  "hotels",
  "import_progress",
  "trips",
  "trip_flights",
  "trip_car_details",
];

const BATCH_SIZE = 500;

function quoteIdentifier(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function normalizeRow(tableName, row) {
  const normalized = { ...row };

  // MySQL obično vraća BOOLEAN kao 0 ili 1.
  if (tableName === "import_progress" && normalized.completed !== null) {
    normalized.completed = Boolean(normalized.completed);
  }

  return normalized;
}

async function getMySqlCount(tableName) {
  const [rows] = await mysqlConnection.query(
    `SELECT COUNT(*) AS count FROM \`${tableName}\``,
  );

  return Number(rows[0].count);
}

async function insertBatch(client, tableName, rows) {
  if (rows.length === 0) {
    return;
  }

  const normalizedRows = rows.map((row) => normalizeRow(tableName, row));
  const columns = Object.keys(normalizedRows[0]);

  const values = [];
  const placeholders = normalizedRows.map((row, rowIndex) => {
    const rowPlaceholders = columns.map((column, columnIndex) => {
      values.push(row[column]);
      return `$${rowIndex * columns.length + columnIndex + 1}`;
    });

    return `(${rowPlaceholders.join(", ")})`;
  });

  const query = `
    INSERT INTO ${quoteIdentifier(tableName)}
      (${columns.map(quoteIdentifier).join(", ")})
    VALUES
      ${placeholders.join(", ")}
  `;

  await client.query(query, values);
}

async function migrateTable(tableName) {
  const totalRows = await getMySqlCount(tableName);

  console.log(`\n${tableName}: ${totalRows} rows found in MySQL`);

  if (totalRows === 0) {
    console.log(`${tableName}: no data to transfer.`);
    return;
  }

  const client = await postgresPool.connect();

  try {
    await client.query("BEGIN");

    let offset = 0;

    while (offset < totalRows) {
      const [rows] = await mysqlConnection.query(
        `SELECT * FROM \`${tableName}\` ORDER BY \`id\` LIMIT ? OFFSET ?`,
        [BATCH_SIZE, offset],
      );

      if (rows.length === 0) {
        break;
      }

      await insertBatch(client, tableName, rows);

      offset += rows.length;

      console.log(
        `${tableName}: ${Math.min(offset, totalRows)}/${totalRows} transfered.`,
      );
    }

    await client.query("COMMIT");
    console.log(`${tableName}: transfer completed.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function resetSequence(tableName) {
  const client = await postgresPool.connect();

  try {
    const result = await client.query(
      `
        SELECT COALESCE(MAX("id"), 0) AS max_id
        FROM ${quoteIdentifier(tableName)}
      `,
    );

    const maxId = Number(result.rows[0].max_id);

    if (maxId > 0) {
      await client.query(
        `
          SELECT setval(
            pg_get_serial_sequence($1, 'id'),
            $2,
            true
          )
        `,
        [tableName, maxId],
      );
    } else {
      await client.query(
        `
          SELECT setval(
            pg_get_serial_sequence($1, 'id'),
            1,
            false
          )
        `,
        [tableName],
      );
    }
  } finally {
    client.release();
  }
}

async function verifyCounts() {
  console.log("\nCheking row number:");

  for (const tableName of TABLES) {
    const mysqlCount = await getMySqlCount(tableName);

    const postgresResult = await postgresPool.query(
      `SELECT COUNT(*) AS count FROM ${quoteIdentifier(tableName)}`,
    );

    const postgresCount = Number(postgresResult.rows[0].count);
    const matches = mysqlCount === postgresCount;

    console.log(
      `${matches ? "✓" : "✗"} ${tableName}: MySQL ${mysqlCount}, Neon ${postgresCount}`,
    );

    if (!matches) {
      throw new Error(`Row number does not match with table ${tableName}.`);
    }
  }
}

async function main() {
  console.log("Checking databse connection...");

  await mysqlConnection.query("SELECT 1");
  await postgresPool.query("SELECT 1");

  console.log("Connection successfull.");
  console.log(
    "Deleting existing data only from Neon tables so the script can restart safely...",
  );

  await postgresPool.query(`
    TRUNCATE TABLE
      "trip_car_details",
      "trip_flights",
      "trips",
      "import_progress",
      "hotels",
      "destination",
      "users"
    RESTART IDENTITY CASCADE
  `);

  for (const tableName of TABLES) {
    await migrateTable(tableName);
  }

  for (const tableName of TABLES) {
    await resetSequence(tableName);
  }

  await verifyCounts();

  console.log("\n✓ All data successfully transfered to Neon.");
}

main()
  .catch((error) => {
    console.error("\n✗ Transfer failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mysqlConnection.end();
    await postgresPool.end();
  });
