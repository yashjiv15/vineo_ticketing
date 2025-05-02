import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AddTicketComponent } from './add-ticket/add-ticket.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxEditorjsModule } from '@tmdjr/ngx-editorjs'; // Import the EditorJSModule from the package
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // Import DatePipe
import  { ReportsComponent } from './reports/reports.component';
import  { LoginComponent } from './login/login.component';
import { DatePipe } from '@angular/common';
import { AuthInterceptor } from './auth.interceptor';
import  { NavbarComponent } from './navbar/navbar.component';

import { MatSelectModule } from '@angular/material/select';
import  { TicketHistoryComponent } from './ticket-history/ticket-history.component';

import { EditorModule } from '@tinymce/tinymce-angular'; // Import EditorModule
import { ScrollingModule } from '@angular/cdk/scrolling'; // Import ScrollingModule
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent, AddTicketComponent,ReportsComponent, LoginComponent,NavbarComponent, TicketHistoryComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        NgxEditorjsModule,
        CKEditorModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        EditorModule,
        BrowserAnimationsModule,
        MatSelectModule,
        ScrollingModule,
        InfiniteScrollModule
       

        
    ],
    providers: [DatePipe, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],  // Corrected providers array

    bootstrap: [AppComponent],
})
export class AppModule { }
