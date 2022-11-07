import { ethers } from "ethers";
import { supportedRPCs } from "./constants/crypto";
import { MetaSupabase } from "./supabase";

export async function loadDecimals(asset: any) {
  const supabase = new MetaSupabase();
  try {
    const decimals: (number | null)[] = [];
    for (let i = 0; i < asset.contracts.length; i++) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          supportedRPCs[asset.blockchains[i]][0]
        );

        const decimal = await new ethers.Contract(
          asset.contracts[i],
          ["function decimals() public view returns(uint256)"],
          provider
        ).decimals();

        decimals.push(decimal.toNumber());
      } catch (e) {
        decimals.push(null);
      }
    }

    await supabase.from("assets").update({ decimals }).match({ id: asset.id });
  } catch (e) {
    console.log(asset, e);
  }
}
