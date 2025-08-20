import cors from "cors";
import "dotenv/config";
import express from "express";
import { apikey } from "./serverClient";

const app = express();

//amything that has .use isnbasically a middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
    res.json({
        message: "AI server is running",
        apiKey : apikey
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
}) 