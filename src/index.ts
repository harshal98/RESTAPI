import express, { Request, Response } from "express";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import axios, { AxiosResponse } from "axios";
import { get } from "http";
import cors from "cors";
let FuturePairs: string[] = [];
const app = express();
const PORT = 3000;
app.use(cors()); // Enable CORS for all origins
// Cache setup with 30-second TTL
const cache = new NodeCache({ stdTTL: 20 });

// External API URLs
const apiUrls: Record<string, string> = {
  jsonplaceholder: "https://jsonplaceholder.typicode.com/posts/1",
  binance: "https://api.binance.com/api/v3/time",
};

// Function to fetch all APIs
const fetchAllAPIs = async (time: string) => {
  const entries = await getKlineData(time);

  return entries;
};

// REST endpoint
app.get("/data", async (req: Request, res: Response) => {
  const time = req.query.time as string; // Cast to string
  let data = cache.get(time);

  if (!data) {
    console.log("Fetching fresh data...");
    data = await fetchAllAPIs(time);
    cache.set(time, data);
    3;
    // res.json("fetched latest data");
  } else {
    console.log("Using cached data...");
    //res.json("using cached data");
  }
  res.json(data);
  //res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

async function getKlineData(time: string) {
  let promisarray: Promise<AxiosResponse<any>>[] = [];
  let FuturePairs: string[] = [];
  await axios
    .get(
      "https://raw.githubusercontent.com/harshal98/Pairs/main/FuturePairs.js"
    )
    .then((res) => (FuturePairs = res.data));

  FuturePairs.forEach((item) => {
    promisarray.push(
      axios.get(
        `https://api.binance.com/api/v3/klines?interval=${time}&limit=200&symbol=${item}`,
        { headers: { pair: item } }
      )
    );
  });
  let res = await axios.all(promisarray);
  let temp: {
    pair: string;
    kline: { c: number; l: number; h: number; o: number }[];
  }[] = [];
  res.forEach((r: AxiosResponse) => {
    let pairUrl = r.config.headers.pair as string;
    let hc: { c: number; l: number; h: number; o: number }[] = [];

    r.data.forEach((i: [number, string, string, string, string, ...any[]]) =>
      hc.push({
        c: Number(i[4]),
        h: Number(i[2]),
        l: Number(i[3]),
        o: Number(i[1]),
      })
    );
    temp.push({ pair: pairUrl, kline: hc });
  });

  return temp;
}

async function getAllTimeKline() {
  let m5m = await getKlineData("5m");
  let m15m = await getKlineData("15m");
  let h1 = await getKlineData("1h");
  let h4 = await getKlineData("4h");
  let d1 = await getKlineData("1d");

  return { m5m, m15m, h1, h4, d1 };
}
