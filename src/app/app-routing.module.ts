import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignuppageComponent } from './signuppage/signuppage.component';
import { LoginpageComponent } from './loginpage/loginpage.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './services/auth.guard';
import { AlreadyLoggedinGuard } from './services/already-loggedin.guard';
import { ScheduleComponent } from './schedule/schedule.component';
import { RegisteredNumbersComponent } from './registered-numbers/registered-numbers.component';
import { HistoryComponent } from './history/history.component';
import { BillingComponent } from './billing/billing.component';
import { NotfoundComponent } from './notfound/notfound.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: ScheduleComponent,
        pathMatch: 'full',
      },
      {
        path: 'numbers',
        component: RegisteredNumbersComponent,
      },
      {
        path: 'history',
        component: HistoryComponent,
      },
      {
        path: 'billing',
        component: BillingComponent,
      },
    ],
  },
  {
    path: 'login',
    component: LoginpageComponent,
    canActivate: [AlreadyLoggedinGuard],
  },
  {
    path: 'signup',
    component: SignuppageComponent,
    canActivate: [AlreadyLoggedinGuard],
  },
  { path: '**', component: NotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
