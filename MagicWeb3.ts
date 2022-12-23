import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import Web3 from "web3";
import Web3HttpProvider from "web3-providers-http";
import { AbiItem } from "web3-utils";
export class MagicWeb3 {
  rpcs: string[];
  proxies: string[];
  alert: boolean;
  index: number;

  constructor(
    rpcs: string[] | string,
    proxies: string[] = [],
    settings: { alert?: boolean; proxies?: boolean } = {
      alert: false,
      proxies: true,
    }
  ) {
    this.rpcs = typeof rpcs == "string" ? [rpcs] : rpcs;
    this.alert = settings.alert ?? true;
    this.proxies = proxies;
    if (settings.proxies) {
      this.fetchProxies();
    }
    this.index = 0;
    // setInterval(() => this.fetchProxies(), 60000);
  }

  eth(log = false) {
    const proxy = this.proxies[this.index % this.proxies.length];
    const rpc = this.rpcs[Math.floor(Math.random() * this.rpcs.length)];
    this.index++;
    // console.log('Fetching with ', proxy)
    const web3 = new Web3(
      new (Web3HttpProvider as any)(
        rpc,
        (proxy ? { agent: { https: new HttpsProxyAgent(proxy) } } : {}) as any
      )
    ).eth;

    return web3;
  }

  logEth() {
    const proxy = this.proxies[this.index % this.proxies.length];
    const rpc = this.rpcs[Math.floor(Math.random() * this.rpcs.length)];
    this.index++;
    // console.log('Fetching with ', proxy)
    const eth = new Web3(
      new (Web3HttpProvider as any)(
        rpc,
        (proxy ? { agent: { https: new HttpsProxyAgent(proxy) } } : {}) as any
      )
    ).eth;

    return { eth, proxy, rpc };
  }

  contract(abi: AbiItem | AbiItem[], address: string) {
    const proxy = this.proxies[this.index % this.proxies.length];
    this.index++;
    const web3 = new Web3(
      new (Web3HttpProvider as any)(
        this.rpcs[Math.floor(Math.random() * this.rpcs.length)],
        (proxy ? { agent: { https: new HttpsProxyAgent(proxy) } } : {}) as any
      )
    );
    return new web3.eth.Contract(abi, address);
  }

  private async fetchProxies() {
    let data: string[] = [];
    try {
      for (let i = 1; i <= this.proxies.length / 250; i++) {
        data = data.concat(
          (
            await axios.get(
              "https://proxy.webshare.io/api/proxy/list/?page=" + i,
              {
                headers: {
                  Authorization:
                    "Token a9b1c399948e3ccebe42d363fec3c3ef5f00c7e4",
                },
              }
            )
          )?.data?.results?.map((proxy: any) => {
            return (
              "http://" +
              proxy.username +
              ":" +
              proxy.password +
              "@" +
              proxy.proxy_address +
              ":" +
              proxy.ports.http
            );
          })
        );
      }

      if (data && data.length > 0) {
        console.log("(MagicWeb3) : updated proxies");
        this.proxies = data;
      }
    } catch (e) {
      console.log("Proxies are down. Impossible to refresh proxies.");
      if (this.alert) {
        axios
          .post(
            "https://hooks.slack.com/services/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",
            {
              channel: "high-severity",
              text: "Proxies are down. Impossible to refresh proxies.",
            }
          )
          .catch((e) => {
            console.log("MagicWeb3) Slack error : " + e);
          });
      }
    }
  }
}

export const loadProxies = async (pages: number, offset = 1) => {
  let data: string[] = [];
  for (let i = offset; i <= pages + offset - 1; i++) {
    data = data.concat(
      (
        await axios.get("https://proxy.webshare.io/api/proxy/list/?page=" + i, {
          headers: {
            Authorization: "Token bmqf0k11ugx45lyumsc2r35lam1qxsfw7tbiozh2",
          },
        })
      )?.data?.results?.map((proxy: any) => {
        return (
          "http://" +
          proxy.username +
          ":" +
          proxy.password +
          "@" +
          proxy.proxy_address +
          ":" +
          proxy.ports.http
        );
      })
    );
  }
  return data;
};
