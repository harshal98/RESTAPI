import express, { Request, Response } from "express";
import fetch from "node-fetch";
import NodeCache from "node-cache";

const app = express();
const PORT = 3000;

// Cache setup with 30-second TTL
const cache = new NodeCache({ stdTTL: 30 });

// External API URLs
const apiUrls: Record<string, string> = {
  jsonplaceholder: "https://jsonplaceholder.typicode.com/posts/1",
  binance: "https://api.binance.com/api/v3/time",
};

// Function to fetch all APIs
const fetchAllAPIs = async (): Promise<Record<string, unknown>> => {
  const entries = await Promise.all(
    Object.entries(apiUrls).map(async ([key, url]) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        return [key, data];
      } catch (err) {
        return [key, { error: (err as Error).message }];
      }
    })
  );

  return Object.fromEntries(entries);
};

// REST endpoint
app.get("/data", async (req: Request, res: Response) => {
  let data = cache.get<Record<string, unknown>>("combined_data");

  if (!data) {
    console.log("Fetching fresh data...");
    data = await fetchAllAPIs();
    cache.set("combined_data", data);
  } else {
    console.log("Using cached data...");
  }

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
