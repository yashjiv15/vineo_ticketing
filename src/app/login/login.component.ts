
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../api.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

    // Add a variable to track the password visibility
    showPassword: boolean = false;
    showConfirmPassword: boolean = false;
    signUpClicked: boolean = false; // Track if the Sign Up button is clicked
   verifyOtp=false;
   resendDisabled = false;
   countdown: number = 120; // Countdown time in seconds
   countdownInterval: any;
   loading: boolean = false; // Variable to track loading state
  
    togglePasswordVisibility() {
      this.showPassword =!this.showPassword;
    }
  

    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword =!this.showConfirmPassword;
    }
 
 
  
    loginForm: any = {};
    showAppHome: boolean = true;
  
    constructor(
      private router: Router,
      private route: ActivatedRoute,
      private apiService: ApiService,
      private datePipe: DatePipe,
      private snackBar: MatSnackBar
    ) {}
  
    ngOnInit() {
      // Subscribe to route changes
      this.route.url.subscribe(urlSegments => {
        // Check if the route is '/' (root) or 'reset-password'
        this.showAppHome = urlSegments.length === 0 || urlSegments[0].path === 'reset-password';
      });
  
      // If you want to handle NavigationEnd event
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          // Check if the route is '/' (root) or 'reset-password'
          this.showAppHome = this.router.url === '/' || this.router.url === '/reset-password';
        }
      });
    }
  
    resendOtp(event: Event) {
      event.preventDefault(); // Prevent default link behavior
    
      // Call the login method to resend the OTP
      this.resend(event);
    
      // Optionally, show a message indicating that OTP has been resent
      this.openSnackBar('OTP has been resent to your email!', 'custom-snackbar');
    }
    
   
    login(event: Event) {
      event.preventDefault();
      this.loading = true;

    
      const loginData = {
        identifier: this.loginForm.identifier,
        password: this.loginForm.password
      };
    
      this.apiService.login(loginData).subscribe(
        response => {
          console.log('Login API response:', response);
          if (response.status === 'success') {
            this.verifyOtp = true; // Show OTP input form
            localStorage.setItem('session-email', this.loginForm.identifier); // Store email in localStorage
            this.startCountdown(); // Start the countdown when OTP is sent

            this.openSnackBar('OTP sent to your email!', 'custom-snackbar');
          } else {
            this.loading = false; // Set loading to false on error

            this.openSnackBar(`Login failed : Incorrect Email/Password`, 'custom-snackbar');
          }
        },
        error => {
          this.loading = false; // Set loading to false on error

          this.openSnackBar('An error occurred during login. Please try again.', 'custom-snackbar');
          console.error('Login error:', error);
        }
      );
    }
    startCountdown() {
      this.resendDisabled = true;
      this.countdown = 120; // Reset countdown to 120 seconds
  
      this.countdownInterval = setInterval(() => {
        this.countdown--;
  
        if (this.countdown <= 0) {
          clearInterval(this.countdownInterval);
          this.resendDisabled = false; // Enable resend link after countdown ends
        }
      }, 1000); // Update every second
    }
    ngOnDestroy() {
      // Clean up interval on component destruction
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    }
  
    resend(event: Event) {
      event.preventDefault();
    
      const loginData = {
        identifier: this.loginForm.identifier,
        password: this.loginForm.password
      };
    
      this.apiService.login(loginData).subscribe(
        response => {
          console.log('Login API response:', response);
          if (response.status === 'success') {
            this.verifyOtp = true; // Show OTP input form
            localStorage.setItem('session-email', this.loginForm.identifier); // Store email in localStorage
          } else {
            this.openSnackBar(`OTP Sending failed:`, 'custom-snackbar');
          }
        },
        error => {
          this.openSnackBar('An error occurred while sending otp. Please try again.', 'custom-snackbar');
          console.error('Login error:', error);
        }
      );
    }
     // Method to handle the back button (go from OTP form to login form)
  goBackToLogin() {
    this.verifyOtp = false; // Set verifyOtp to false to show the login form again
    this.loading = false; // Set loading to false on error


  }
    verifyOTP(event: Event) {
      event.preventDefault();
    
      const otpData = {
        otp: this.loginForm.otp // Send OTP to backend for verification
      };
    
      const email = localStorage.getItem('session-email'); // Get the email from localStorage
    
      if (email) {
        this.apiService.verifyOtp(otpData, email).subscribe(
          response => {
            if (response.status === 'success') {
              localStorage.setItem('isLoggedIn', 'true'); // Set login state
              this.router.navigate(['/report']); // Redirect to the report page
              this.openSnackBar('Logged in successfully!', 'custom-snackbar');
            } else {
              this.openSnackBar(`Verification failed: ${response.message}`, 'custom-snackbar');
            }
          },
          error => {
            this.openSnackBar('An error occurred during OTP verification. Please try again.', 'custom-snackbar');
            console.error('OTP verification error:', error);
          }
        );
      } else {
        this.openSnackBar('No email found in session. Please log in again.', 'custom-snackbar');
      }
    }
    
    /**
     * isValidEmail is a function that is used to determine if an email address is valid. It uses a regular expression to validate the email address, and returns true if it is valid, false otherwise.
     * @param email the email address to validate
     */
    isValidEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  

    openSnackBar(message: string, panelClass: string) {
  
      const config = new MatSnackBarConfig();
      config.duration = 2000;
      config.panelClass = [panelClass];
      this.snackBar.open(message, 'Close', config);
    }
  }