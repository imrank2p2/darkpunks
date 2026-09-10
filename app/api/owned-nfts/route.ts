import { NextResponse } from "next/server";

const NFT_CONTRACT =
  "0x7553539C27B550d14fcdccd19fa78f8F6CD057BB";

const BASE = "https://api.blockscout.com/4663/api/v2";

async function blockscout(path: string) {
  const apiKey = process.env.BLOCKSCOUT_API_KEY;

  if (!apiKey) {
    throw new Error("BLOCKSCOUT_API_KEY IS MISSING");
  }

  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("apikey", apiKey);

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
      {
        ids: [],
        balance: 0,
        error: "INVALID WALLET ADDRESS",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const data = await blockscout(`/addresses/${address}/nft`);

    const items = Array.isArray(data?.items)
      ? data.items
      : [];

    const ids: number[] = [];

    for (const item of items) {
      const tokenAddress = String(
        item?.token?.address_hash ||
        item?.token_address ||
        item?.token?.address ||
        ""
      ).toLowerCase();

      if (tokenAddress !== NFT_CONTRACT.toLowerCase()) {
        continue;
      }

      const tokenId =
        item?.id ??
        item?.token_id ??
        item?.instance?.id ??
        item?.instance?.token_id;

      if (tokenId === undefined || tokenId === null) {
        continue;
      }

      const id = Number(tokenId);

      if (Number.isInteger(id) && id > 0) {
        ids.push(id);
      }
    }

    const uniqueIds = [...new Set(ids)].sort((a, b) => a - b);

    return NextResponse.json({
      ids: uniqueIds,
      balance: uniqueIds.length,
      source: "blockscout-api",
      error: null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "COULD NOT LOAD NFT OWNERSHIP";

    console.error("DARK PUNKS OWNERSHIP ERROR:", message);

    return NextResponse.json(
      {
        ids: [],
        balance: 0,
        error: message,
      },
      {
        status: 502,
      }
    );
  }
}
