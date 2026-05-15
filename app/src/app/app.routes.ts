import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login.component';
import { HomeComponent } from './home/home.component';
import { MemberHomeComponent } from './member-home/member-home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Qwizle' },
  { path: 'login', component: LoginComponent, title: 'Log in | Qwizle' },
  { path: 'home', component: MemberHomeComponent, canActivate: [authGuard], title: 'Today | Qwizle' },
  { path: '**', redirectTo: '' },
];
