require('dotenv').config();
import * as admin from 'firebase-admin';

admin.initializeApp();

export { signup } from './signup';
export { api } from './api';
export { callApi } from './call';
