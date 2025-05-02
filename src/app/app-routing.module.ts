import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import  { AddTicketComponent } from './add-ticket/add-ticket.component';
import  { ReportsComponent } from './reports/reports.component';
import  { LoginComponent } from './login/login.component';
import  { TicketHistoryComponent } from './ticket-history/ticket-history.component';

import { PreventAccessGuard } from './prevent-access.guard'; // Import the guard service
import { AdminAccessGuard } from './admin-access.guard'; // Import the guard service





const routes: Routes = [
  { path: 'report', component: ReportsComponent , canActivate: [PreventAccessGuard]  }, 
  { path: 'navbar', component: NavbarComponent, canActivate: [PreventAccessGuard]   }, 
  { path: '', component: AddTicketComponent},
  { path: 'admin', component: LoginComponent}, // Use the new guard here
  { path: 'ticket-history/:id', component: TicketHistoryComponent, canActivate: [PreventAccessGuard]  },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
