import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { RegisteredNumber } from '../models/models';
import { AuthService } from './auth.service';
import { switchMap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NumberService {
  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private httpClient: HttpClient
  ) {}

  get allPhoneNumbers(): RegisteredNumber[] {
    return this.auth.user.phoneNumbers;
  }

  get verifiedNumbers(): RegisteredNumber[] {
    return this.auth.user.phoneNumbers.filter((item) => item.verified);
  }

  async registerNumber(numberToRegister: RegisteredNumber) {
    const val = await this.afs.doc(`users/${this.auth.user.uid}`).set(
      {
        phoneNumbers: [
          ...(this.auth.user.phoneNumbers || []),
          { ...numberToRegister, verified: false },
        ],
      },
      { merge: true }
    );
    return val;
  }

  callToVerify(num: RegisteredNumber) {
    this.httpClient
      .post('http://localhost:5001/mailer-5fecf/us-central1/callApi/verify', {
        num: num.phoneNum,
        uid: this.auth.user.uid,
      })
      .subscribe(
        (data) => {
          console.log(data);
        },
        (err) => {
          console.error(err);
        }
      );
  }

  /**
   * @param phoneNumToUpdate number to update
   * @param currentlyActioning need this to verify which one we're editing in the db since phoneNumbers list doesnt have unique ids
   */
  async updatePhoneNum(
    phoneNumToUpdate: Partial<RegisteredNumber>,
    currentlyActioning: RegisteredNumber
  ) {
    const ref = await this.afs.doc(`users/${this.auth.user.uid}`).ref;
    const data = await (await ref.get()).data();
    const updatedPhoneNumbers = data.phoneNumbers.map((num) => {
      // verify same with stringify since we dont have unique ids
      if (this.isSameNumber(currentlyActioning, num)) {
        return { ...num, ...phoneNumToUpdate };
      }
      return num;
    });
    return await ref.set(
      { phoneNumbers: updatedPhoneNumbers },
      { merge: true }
    );
  }

  async deleteNumber(currentlyActioning: RegisteredNumber) {
    const ref = await this.afs.doc(`users/${this.auth.user.uid}`).ref;
    const data = await (await ref.get()).data();
    console.log({ currentlyActioning });
    console.log(data.phoneNumbers);
    const updatedPhoneNumbers = data.phoneNumbers.filter(
      (num) => !this.isSameNumber(currentlyActioning, num)
    );
    console.log(updatedPhoneNumbers);
    return await ref.set(
      { phoneNumbers: updatedPhoneNumbers },
      { merge: true }
    );
  }

  isSameNumber(num1: RegisteredNumber, num2: RegisteredNumber) {
    return num1.phoneNum === num2.phoneNum && num1.title === num2.title;
  }
}
