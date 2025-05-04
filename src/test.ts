import axios, { AxiosResponse } from "axios";

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

getKlineData("1m");
