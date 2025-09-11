import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 4001;

app.get("/", (req, res) => {
  res.send("Hello Module");
});

connectDB()
  .then(console.log("App listening and connected to DB"))
  .catch((error) => {
    console.log("Error accured in DB connection", error);
  });

app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});
