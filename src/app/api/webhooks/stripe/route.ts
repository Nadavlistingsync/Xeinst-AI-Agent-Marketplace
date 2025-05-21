import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { productId, userId } = session.metadata!;

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from("purchases")
        .insert([
          {
            user_id: userId,
            product_id: productId,
          },
        ]);

      if (purchaseError) {
        console.error("Error creating purchase record:", purchaseError);
        return NextResponse.json(
          { error: "Failed to create purchase record" },
          { status: 500 }
        );
      }

      // Get product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("price, uploaded_by, earnings_split")
        .eq("id", productId)
        .single();

      if (productError) {
        console.error("Error fetching product:", productError);
        return NextResponse.json(
          { error: "Failed to fetch product" },
          { status: 500 }
        );
      }

      // Calculate creator earnings
      const creatorEarnings = product.price * product.earnings_split;

      // Create earnings record
      const { error: earningsError } = await supabase
        .from("earnings")
        .insert([
          {
            user_id: product.uploaded_by,
            product_id: productId,
            amount: creatorEarnings,
            status: "pending",
          },
        ]);

      if (earningsError) {
        console.error("Error creating earnings record:", earningsError);
        return NextResponse.json(
          { error: "Failed to create earnings record" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
} 