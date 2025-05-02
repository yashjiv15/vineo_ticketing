// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';

export interface ApiResponse {
  tickets: any[];
  status: string;
  message: string;
  email?: string;

  
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
private apiUrl = 'https://b2ccomplaints.dorfketal.com/getdata'; // Update with your Flask API URL
//private apiUrl = 'http://localhost:8000'; // Update with your Flask API URL


  constructor(private http: HttpClient) { }

 
  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('your-token') || '';
    const sessionEmail = localStorage.getItem('session-email') || '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Session-Email': sessionEmail,
    });
  }

  
  login(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/login/`, data).pipe(
      tap(response => {
        if (response.status === 'success' && response.email) {
        }
      })
    );
  }
  verifyOtp(data: any, email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/verify_otp/?email=${email}`, data).pipe(
      tap(response => {
        if (response.status === 'success' && response.email) {
          localStorage.setItem('session-email', response.email);
        }
      })
    );
  }
  
  logout(): Observable<ApiResponse> {
    const headers = this.getHeaders();
    return this.http.post<ApiResponse>(`${this.apiUrl}/logout/`, {}, { headers });
  }

  CreateTicket(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create_ticket/`, data);
  }
  GetTickets(): Observable<ApiResponse> {
    const headers = this.getHeaders();
    return this.http.post<ApiResponse>(`${this.apiUrl}/get_tickets/`, {}, { headers });
  }


  getStatusOptions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get_status_options/`, { headers: this.getHeaders() });
  }
  getExcelToExport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/export_to_excel`, { headers: this.getHeaders() });
  }


  getDistributorName(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get_distributors/`, { headers: this.getHeaders() });
  }
  getTicketDetails(ticketId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fetch_ticket_details/${ticketId}`, { headers: this.getHeaders() });
  }
  // Update your ApiService to include the method for updating ticket status
updateTicketStatus(data: any): Observable<any> {
  const headers = this.getHeaders();
  return this.http.post(`${this.apiUrl}/update_ticket_status/`, data, { headers });

}
updateTicketAndCommentStatus(data: any): Observable<any> {
  const headers = this.getHeaders();
  return this.http.post(`${this.apiUrl}/update_status_and_comment/`, data, { headers });

}

getTicketStatus(ticketId: string): Observable<any> {
  const headers = this.getHeaders();
  const body = { ticket_id: ticketId }; // JSON data containing ticket ID
  return this.http.post<any>(`${this.apiUrl}/get_ticket_status/`, body, { headers });
}

checkMobile(mobile: string): Observable<any> {
  const headers = this.getHeaders();
  const body = { mobile: mobile }; // JSON data containing mobile number
  return this.http.post<any>(`${this.apiUrl}/check_mobile/`, body, { headers });
}
checkState(selectedState: string): Observable<any> {
  const headers = this.getHeaders();
  const body = { state: selectedState }; // JSON data containing mobile number
  return this.http.post<any>(`${this.apiUrl}/check_state/`, body, { headers });
}
getStateCity(): Observable<any> {
  const headers = this.getHeaders();
    return this.http.post<ApiResponse>(`${this.apiUrl}/get_state_city/`, {}, { headers });
}
GetCompanyDetails(company_type: string, company_category: string, page: number = 1, per_page: number = 50): Observable<any> {
  const headers = this.getHeaders();
  const body = { company_type: company_type, company_category: company_category, page: page, per_page: per_page };
  return this.http.post<any>(`${this.apiUrl}/get_company_details/`, body, { headers });
}
updateStatus(data: any): Observable<any> {
  const headers = this.getHeaders();
  return this.http.post(`${this.apiUrl}/update_status/`, data, { headers });

}
}
