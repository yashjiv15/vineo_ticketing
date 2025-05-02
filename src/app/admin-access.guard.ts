import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminAccessGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if the user is accessing from the intranet or Citrix
    const isAllowedAccess = this.checkAccess();

    if (!isAllowedAccess) {
      // Redirect to a different page if access is not allowed
      this.router.navigate(['/']); // Redirect to home or another appropriate page
      return false;
    }
    return true;
  }

  private checkAccess(): boolean {
    const host = window.location.hostname;

    // Allow access if the user is in the intranet or connecting via Citrix
    return (
      host.startsWith('172.30.30.198') ||  // Intranet IPs
      host === 'complaints.dorfketal.com'  // Allow Citrix users
    );
  }
}
