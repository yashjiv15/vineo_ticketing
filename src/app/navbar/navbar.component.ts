import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  statusOptions: any;
  selectedStatus: any;
  ticketStatus: string | undefined; // Variable to hold the ticket status
  searchInput: string = ''; // Variable to hold the user-entered ticket ID
  isLoggedIn: boolean = localStorage.getItem('isLoggedIn') === 'true';

  constructor(private apiService: ApiService, private snackBar: MatSnackBar, private router: Router) { } // Inject ApiService
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
  ngOnInit(): void {
    // Fetch status options when component initializes
    this.apiService.getStatusOptions().subscribe(
      (response) => {
        this.statusOptions = response.status_options;
      },
      (error) => {
        console.error('Error fetching status options:', error);
      }
    );
  }

  // Method to handle search button click
  onSearch(): void {
    if (this.searchInput.trim() !== '') {
      // Fetch ticket status for the entered ticket ID
      this.apiService.getTicketStatus(this.searchInput).subscribe(
        (response) => {
          this.ticketStatus = response.status; // Set the ticket status
        },
        (error) => {
          console.error('Error fetching ticket status:', error);
        }
      );
    }
  }
  openSnackBar(message: string, panelClass: string) {
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = [panelClass];
    this.snackBar.open(message, 'Close', config);
  }
  
  logout() {
    console.log('Logging out...');

    this.apiService.logout().subscribe(
      (response) => {
        console.log(response);
        this.openSnackBar('Successfully logged out', 'custom-snackbar');
        localStorage.clear();
        sessionStorage.clear();
        localStorage.removeItem('isLoggedIn');

        this.router.navigate(['/admin'], { replaceUrl: true });
      },
      (error) => {
        this.openSnackBar('Successfully logged out', 'custom-snackbar');
        localStorage.clear();
        sessionStorage.clear();
        localStorage.removeItem('isLoggedIn');

        this.router.navigate(['/admin'], { replaceUrl: true });
      }
    );
  }
  isLoginPage(): boolean {
    return this.router.url === '/admin';
  }
}
