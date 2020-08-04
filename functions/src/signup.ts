import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as aws from 'aws-sdk';

const SES = new aws.SES({ region: 'us-east-1' });
const db = admin.firestore();

export const signup = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snapshot, ctx) => {
    const data = snapshot.data();
    console.log('user added to mailing list', data);
    const userRef = await db.doc(`users/${snapshot.ref.id}`);
    await userRef.set({...data, currentProduct: 0});
    console.log('added currentProduct index');
    return SES.sendEmail({
      Destination: {
        ToAddresses: [data.email || 'sh4d0vvk111@gmail.com'],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: '<h3>you\'ve signed up to be better at, you will recieve emails with daily challenges</h3>',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Welcome to BetterAt',
        },
      },
      Source: 'aponventure@gmail.com',
    }).promise();
  });
