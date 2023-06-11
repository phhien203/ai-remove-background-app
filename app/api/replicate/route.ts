import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: Request) {
  const req = await request.json();

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN as string,
  });

  const model =
    "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

  const input = {
    image: req.image,
  };

  const output = await replicate.run(model, { input });

  if (!output) {
    console.error("Something went wrong");
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }

  console.log("Output", output);

  return NextResponse.json({ output }, { status: 201 });
}
