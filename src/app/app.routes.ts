// app.route.ts
import { Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import  { AddTicketComponent } from './add-ticket/add-ticket.component';
import  { ReportsComponent } from './reports/reports.component';
import  { LoginComponent } from './login/login.component';
import  { TicketHistoryComponent } from './ticket-history/ticket-history.component';



export const routes: Routes = [
  { path: 'navbar', component: NavbarComponent },
  { path: '', component: AddTicketComponent }, 
  { path: 'report', component:ReportsComponent },
  { path: 'admin', component: LoginComponent }, 
  { path: 'ticket-history/:id', component: TicketHistoryComponent  }


  // Add other routes here
];
