import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { Twilio, twiml as tml } from 'twilio';

const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser());

const tw = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

app.post('/verify', async (req, res) => {
  try {
    const call = await tw.calls.create({
      url: `${process.env.CALL_FUNCTION_ROOT_ENDPOINT}/voice?uid=${req.body.uid}`,
      method: 'post',
      to: req.body.num,
      from: process.env.TWILIO_NUM!,
      // statusCallback: `${process.env.CALL_FUNCTION_ROOT_ENDPOINT}/result?uid=${req.body.uid}`,
      // statusCallbackMethod: 'post',
    });
    console.log('call was queued successfully');
    res.send({ callStatus: call.status });
  } catch (error) {
    console.error(
      `path=/verify payload=${JSON.stringify(req.body)} error=${JSON.stringify(
        error
      )}`
    );
    res.status(error.status).send({ code: error.code });
  }
});

// app.post('/result', (req, res) => {
//   console.log('/result callback');
//   console.log(req.body);
//   res.send('ok');
// });

app.post('/voice', async (req, res) => {
  const uid = req.query.uid as string;
  console.log('/voice starting', uid, req.body);
  const twiml = new tml.VoiceResponse();
  function gather() {
    twiml.pause({ length: 1 });
    twiml.say(
      'You are recieving this call from CallMeMaybe to verify your number'
    );
    twiml.pause({ length: 0.5 });
    twiml.say('If you have recieved this call in error, please hang up.');
    const gatherNode = twiml.gather({ numDigits: 2 });
    gatherNode.say('To verify this number, press 1 1');
    twiml.redirect(
      `${process.env.CALL_FUNCTION_ROOT_ENDPOINT}/voice?uid=${uid}`
    );
  }

  // If the user entered digits, process their request
  if (req.body.Digits) {
    switch (req.body.Digits) {
      case '11':
        await updateNumberStatusToVerified(uid, req.body.To);
        twiml.say('Your phone number has been verified');
        break;
      default:
        twiml.say("Sorry, I don't understand that choice.").break_;
        gather();
        break;
    }
  } else {
    // If no input was sent, use the <Gather> verb to collect user input
    gather();
  }

  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
});

async function updateNumberStatusToVerified(uid: string, phoneNum: string) {
  const doc = await db.doc(`users/${uid}`);
  const data = await (await doc.get()).data();

  if (data && data.phoneNumbers.length > 0) {
    await doc.set(
      {
        phoneNumbers: data.phoneNumbers.map((item) =>
          item.phoneNum === phoneNum ? { ...item, verified: true } : item
        ),
      },
      { merge: true }
    );
    console.log(`verified ${phoneNum} for ${uid}`);
  } else {
    console.warn(`${uid} user doesnt have any data`);
  }
}

export const callApi = functions.https.onRequest(app);
