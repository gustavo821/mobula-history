import { ethers } from "ethers";
import { blockchains as mobulaBlockchains } from "mobula-utils";
import { BlockchainName } from "mobula-utils/lib/chains/model";
import { createSupabaseClient } from "./supabase";


// @TODO type safety
export async function loadDecimals(asset: any) {
  const supabase = createSupabaseClient()
  try {
    const decimals: (number | null)[] = [];
    for (let i = 0; i < asset.contracts.length; i++) {
      try {
        const provider =  mobulaBlockchains[asset.blockchains[i] as BlockchainName].ethersProvider;

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
