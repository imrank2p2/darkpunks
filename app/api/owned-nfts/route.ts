import { NextResponse } from "next/server";

const NFT_CONTRACT =
  "0x7553539C27B550d14fcdccd19fa78f8F6CD057BB";

const BASE = "https://robinhoodchain.blockscout.com/api/v2";

async function blockscout(path: string) {
  const apiKey = process.env.BLOCKSCOUT_API_KEY;
  const url = new URL(`${BASE}${path}`);

  // The Robinhood Chain Blockscout instance exposes the public v2 NFT
  // endpoint. A Pro API key can still be supplied in Vercel for higher limits.
  if (apiKey && apiKey !== "your_blockscout_api_key_here") {
    url.searchParams.set("apikey", apiKey);
  }

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Blockscout API returned HTTP ${response.status}: ${text.slice(0, 500)}`
    );
  }

  return JSON.parse(text);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const address = (searchParams.get("address") || "")
    .trim()
    .toLowerCase();

  if (!/^0x[a-f0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { ids: [], balance: 0, error: "INVALID WALLET ADDRESS" },
      { status: 400 }
    );
  }

  const contract = NFT_CONTRACT.toLowerCase();

  try {
    const ids = new Set<number>();

    // 1) Current NFT ownership endpoint. This is the cleanest source because
    // Blockscout calculates the NFTs currently held by the connected address.
    // AddressNFTInstance uses token_contract_address_hash + token_id, while
    // some older indexer versions expose the same values under token/token_instance.
    let path = `/addresses/${address}/nft?type=ERC-721`;
    let pages = 0;

    while (path && pages < 100) {
      const data = await blockscout(path);
      const items = Array.isArray(data?.items) ? data.items : [];

      for (const item of items) {
        const tokenAddress = String(
          item?.token_contract_address_hash ||
          item?.token?.address ||
          item?.token?.address_hash ||
          item?.token_address ||
          item?.token_instance?.token?.address ||
          ""
        ).toLowerCase();

        if (tokenAddress !== contract) continue;

        const rawTokenId =
          item?.token_id ??
          item?.id ??
          item?.token_instance?.id ??
          item?.token_instance?.token_id ??
          item?.instance?.id;

        const id = Number(rawTokenId);
        if (Number.isInteger(id) && id >= 0) ids.add(id);
      }

      const next = data?.next_page_params;
      if (next && typeof next === "object") {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(next as Record<string, unknown>)) {
          if (value !== undefined && value !== null) query.set(key, String(value));
        }
        path = `/addresses/${address}/nft?type=ERC-721&${query.toString()}`;
      } else {
        path = "";
      }
      pages += 1;
    }

    // 2) Legacy Blockscout account API fallback. Some Robinhood Chain
    // indexer deployments expose token transfers through the legacy endpoint
    // even when the v2 ownership endpoint is delayed or incomplete.
    if (ids.size === 0) {
      const apiKey = process.env.BLOCKSCOUT_API_KEY;
      let page = 1;
      const offset = 100;

      while (page <= 100) {
        const url = new URL("https://robinhoodchain.blockscout.com/api");
        url.searchParams.set("module", "account");
        url.searchParams.set("action", "tokentx");
        url.searchParams.set("address", address);
        url.searchParams.set("contractaddress", NFT_CONTRACT);
        url.searchParams.set("page", String(page));
        url.searchParams.set("offset", String(offset));
        url.searchParams.set("sort", "desc");
        if (apiKey && apiKey !== "your_blockscout_api_key_here") {
          url.searchParams.set("apikey", apiKey);
        }

        const response = await fetch(url.toString(), {
          headers: { accept: "application/json" },
          cache: "no-store",
        });
        if (!response.ok) break;

        const data = await response.json();
        const items = Array.isArray(data?.result) ? data.result : [];
        if (items.length === 0) break;

        const latestByToken = new Map<number, { owned: boolean; block: number; logIndex: number }>();

        for (const item of items) {
          const id = Number(item?.tokenID ?? item?.tokenId);
          if (!Number.isInteger(id) || id < 0) continue;

          const from = String(item?.from || "").toLowerCase();
          const to = String(item?.to || "").toLowerCase();
          const block = Number(item?.blockNumber || 0);
          const logIndex = Number(item?.logIndex || 0);
          const existing = latestByToken.get(id);
          const isNewer = !existing || block > existing.block || (block === existing.block && logIndex > existing.logIndex);

          if (isNewer) {
            latestByToken.set(id, {
              owned: to === address,
              block,
              logIndex,
            });
          }
        }

        for (const [id, state] of latestByToken) {
          if (state.owned) ids.add(id);
        }

        if (items.length < offset) break;
        page += 1;
      }
    }

    const sortedIds = [...ids].sort((a, b) => a - b);

    return NextResponse.json({
      ids: sortedIds,
      balance: sortedIds.length,
      source: "blockscout",
      error: null,
    });
  } catch (error) {
    console.error("DARK PUNKS OWNERSHIP ERROR:", error);

    return NextResponse.json(
      { ids: [], balance: 0, error: "COULD NOT LOAD NFT OWNERSHIP" },
      { status: 502 }
    );
  }
}
