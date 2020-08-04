import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { AppUser } from '../models/models';
import { User, auth } from 'firebase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<AppUser>;
  private readonlyUser: AppUser;

  get user() {
    return this.readonlyUser;
  }

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      // tap(console.log),
      switchMap((user) => {
        if (user) {
          // console.log('user', user);
          return this.afs.doc(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      }),
      tap((user) => (this.readonlyUser = user))
    );
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential: auth.UserCredential = await this.afAuth.signInWithPopup(
      provider
    );
    // console.log('credential', credential);
    return await this.updateUserDate(credential.user);
  }

  private updateUserDate(user: firebase.User) {
    const userRef: AngularFirestoreDocument<firebase.User> = this.afs.doc(
      `users/${user.uid}`
    );
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    return userRef.set(data as any, { merge: true });
  }

  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(['/']);
  }

  async signOutWithConfirm() {
    const confirmed = window.confirm('are you sure you want to logout?');
    if (confirmed) {
      await this.signOut();
    }
  }
}
