import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: true,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      // ✅ PRODUCTS
      line_items: items.map(item => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.qty,
      })),

      // ✅ EXPLICITLY collect billing address
      billing_address_collection: "required",
      
      // ✅ ALWAYS collect shipping address
      shipping_address_collection: {
        allowed_countries: ["PT", "FR", "ES", "DE", "NL", "BE", "IT", "IE", "GB", "US", "CA", "CH", "NO", "SE", "DK"],
      },

      // ✅ Phone number collection
      phone_number_collection: {
        enabled: true,
      },

      // ✅ SHIPPING OPTIONS with correct format
      shipping_options: [
        {
          shipping_rate: "shr_1ToSHuA5iFvf2pvFm2Ku5ZWZ", // Portugal
        },
        {
          shipping_rate: "shr_1TfHeJA5iFvf2pvFouwcJz6G", // EU
        },
        {
          shipping_rate: "shr_1ToSQmA5iFvf2pvFjedvNv6T", // Worldwide
        },
      ],

      success_url: "https://stagingfun.vercel.app/?success=true",
      cancel_url: "https://stagingfun.vercel.app/?canceled=true",
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}