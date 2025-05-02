import { Component, ElementRef, ViewChild ,} from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { ApiService } from '../api.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { HostListener } from '@angular/core';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';


@Component({
  selector: 'app-add-ticket',
  templateUrl: './add-ticket.component.html',
  styleUrls: ['./add-ticket.component.css']
})
export class AddTicketComponent {
 
  rows = [{
    product: '',
    quantity: '',
    qtyType: '',
    complaint: '',
  }];

  savedRows: any[] = [];

  saveRow() {
    this.savedRows.push({ ...this.rows[0] });
    this.rows[0] = { product: '', quantity: '', qtyType: '', complaint: '' };
  }
}