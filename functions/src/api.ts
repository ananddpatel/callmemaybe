import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { Stripe } from 'stripe';
import * as aws from 'aws-sdk';

const stripe = new Stripe(<string>process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
});
// const webhookSecret = <string>process.env.STRIPE_WEBHOOK_SECRET_KEY;
const webhookSecret = 'whsec_wgQ28ysO9vBWtYGfeBgaUvHLYarEaH7C';
const db = admin.firestore();
const SES = new aws.SES({ region: 'us-east-1' });

const app = express();
app.use(cors({ origin: true }));

var rawBodySaver = function (
  req: any,
  res: any,
  buf: Buffer,
  encoding: string
) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};
app.use(
  bodyParser.json({
    verify: rawBodySaver,
  })
);

type CheckoutRequestPayload = {
  successUrl: string;
  cancelUrl: string;
  email: string;
};

app.post('/checkout', async (req, res) => {
  const payload = <CheckoutRequestPayload>req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1H7YFiDDQKq3wHCaOGyjPIeh',
          quantity: 1,
        },
      ],
      customer_email: payload.email,
      mode: 'subscription',
      success_url: `${payload.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: payload.cancelUrl,
    });
    console.log('session', session);

    console.log('Checkout session created', {
      email: req.body.email,
      checkoutSessionId: session.id,
    });

    res.send({ checkoutSessionId: session.id });
  } catch (error) {
    res.status(500).send({
      type: error.raw.type,
      message: error.message,
      code: error.raw.code,
    });
  }
});

app.post('/billingportal', async (req, res) => {
  // stripe.billingPortal.sessions.create( )
});

app.post('/webhook', bodyParser.raw({ type: 'charset=utf-8' }), (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const rawBody = (req as any).rawBody;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.log(err);
    res.status(400).send(`Webhook Error: ${err.message}`).status(500);
    return;
  }

  // Handle the checkout.session.completed event
  // console.log(event.type, JSON.stringify(event.data.object));
  if (event?.type === 'payment_intent.succeeded') {
    handleSubscriptionPayment(event.data.object);
  } /* handle */

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
  return;
});

async function handleSubscriptionPayment(eventDTO: any) {
  const existingUser = await db
    .collection('users')
    .where('email', '==', eventDTO.receipt_email)
    .get();

  // let userRef;
  if (!existingUser.empty) {
    const userRef = existingUser.docs[0].ref;
    await userRef.update({ customerId: eventDTO.customer, pro: true });
    console.log(
      'subscription created and paid for existing user',
      eventDTO.receipt_email
    );
    try {
      await SES.sendEmail({
        Destination: {
          ToAddresses: [eventDTO.receipt_email],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: '<h3>congrats on becoming a pro member</h3>',
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'congrats on becoming a pro member',
          },
        },
        Source: 'aponventure@gmail.com',
      }).promise();
      console.log(`pro email sent to ${eventDTO.receipt_email}`);
    } catch (error) {
      console.error(`error sending email to ${eventDTO.receipt_email}`, error);
    }
    console.log('email setn');
  } else {
    await db.collection('users').add({
      email: eventDTO.receipt_email,
      customerId: eventDTO.customer,
      pro: true,
      timezoneOffset: new Date().getTimezoneOffset(),
      currentProduct: 0,
    });
    console.log(
      'subscription created and paid for a new user',
      eventDTO.receipt_email
    );
  }
}

export const api = functions.https.onRequest(app);
