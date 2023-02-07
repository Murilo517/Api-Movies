import { Client } from "pg";

const client: Client = new Client({
  user: "murilo",
  password: "123",
  host: "localhost",
  database: "moviesDb",
  port: 5432,
});

const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("database connected");
};

export { client, startDatabase };
