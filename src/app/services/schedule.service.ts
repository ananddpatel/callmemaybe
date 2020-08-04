import { Injectable } from '@angular/core';
import { Reminder } from '../models/models';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  reminders$ = new Subject();
  reminders: Reminder[] = [];
  constructor(private afs: AngularFirestore, private auth: AuthService) {
    this.afs
      .collection('reminders')
      .ref.where('uid', '==', this.auth.user.uid)
      .onSnapshot((data) => {
        console.log(data.docs);
        data.docs.forEach((d) => {
          console.log(d.data());
        });
      });
  }

  async add(r: Partial<Reminder>) {
    console.log(r, this.auth.user.uid);
    const doc = {
      ...r,
      uid: this.auth.user.uid,
      status: 'scheduled',
    } as Reminder;
    await this.afs.collection('reminders').add(doc);
  }
}
