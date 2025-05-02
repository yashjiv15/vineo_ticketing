import { Component, HostListener } from '@angular/core';
import { ApiService, ApiResponse } from '../api.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})

export class ReportsComponent {
closeDescriptionPopup() {
this.isPopupOpen=false
}
  inputValue: string = '';
  tickets: any[] = []; // Initialize an empty array to store ticket data
  statusOptions: string[] = [];
  selectedStatus: string = ''; // Variable to store the selected status
  originalTickets: any[] = []; // Variable to store the original list of tickets
  ticket_details: any = {};
  Array: any;
  $index: any;
  ticketComments: string = ''; // Variable to store comments for the ticket
  ticket: any = {}; 
  editedTicket: any = {};
  inputComment: string = '';
  isMobile: boolean | undefined;
  isPopupOpen = false; // Control the visibility of the popup
  selectedDescription: string = ''; // Initialize with an empty string
  isOpen=false;
  ticketDetails: any = null; // Holds the ticket details for the selected ticket
  popupVisible = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) { // Explicitly specify the type of the event parameter
    this.isMobile = window.innerWidth <= 1280;
  }



  constructor(private apiService: ApiService, private snackBar: MatSnackBar, private router: Router) { }
    ngOnInit(): void {
      this.fetchStatusOptions();
      this.fetchticketlist();
    }
  
  
    filterTable(): void {
      const filterValue = this.inputValue.toLowerCase();
      const rows = document.querySelectorAll<HTMLTableRowElement>("#myTable tr");
      rows.forEach(row => {
        const cells = row.querySelectorAll("td"); // Change to querySelectorAll("td")
        let rowVisible = false;
        cells.forEach(cell => {
          if (cell.textContent && cell.textContent.toLowerCase().includes(filterValue)) {
            rowVisible = true;
          }
        });
        (row as HTMLElement).style.display = rowVisible ? "" : "none";
      });
    }
    
  fetchticketlist() {
    this.apiService.GetTickets().subscribe(
      (response) => {
        if (response && response.tickets) {
          this.tickets = response.tickets||[]; // Assign the fetched tickets to the component variable
        } else {
          console.error('Failed to fetch ticket list:', response);
        }
      },
      (error) => {
        console.error('Error fetching ticket list:', error);
      }
    );
  }
  openDescriptionPopup(description: string) {
    console.log('Opening description popup with:', description); // Log description
    this.selectedDescription = description; // Set the description to show in the popup
    this.isPopupOpen = true; // Open the popup
  }
  exportToExcel() {
    this.apiService.getExcelToExport().subscribe(
      (response: any) => {
        const ticketsData = response.tickets;
  
        // Transform the data into a flat structure
        const formattedData = ticketsData.map((ticket: { ticket_id: any; company_name: any; company_type: any; status: any; created_at: any; description: any; email: any; first_name: any; last_name: any; mobile: any; invoice_number: any; invoice_date: any; product_name: any[]; quantity: any[]; quantity_type: any[]; complaint_type: any[]; updated_by: any; product_comments: { comment: any; }[]; images: any[]; ticket_comments: string; }) => {
          // Parse ticket_comments from string to JSON
          const ticketComments = JSON.parse(ticket.ticket_comments || '[]');
  
          return {
            'Ticket ID': ticket.ticket_id,
            'Company Name': ticket.company_name,
            'Company Type': ticket.company_type,
            'Status': ticket.status,
            'Created At': ticket.created_at,
            'Description': ticket.description,
            'Email': ticket.email,
            'First Name': ticket.first_name,
            'Last Name': ticket.last_name,
            'Mobile': ticket.mobile,
            'Invoice Number': ticket.invoice_number,
            'Product Name': ticket.product_name.join(', '), // Join multiple product names
            'Quantity': ticket.quantity.join(', '), // Join multiple quantities
            'Quantity Type': ticket.quantity_type.join(', '), // Join multiple quantity types
            'Complaint Type': ticket.complaint_type.join(', '), // Join multiple complaint types
            'Updated By': ticket.updated_by,
            'Product Comments': ticket.product_comments.map((comment: { comment: any; }) => comment.comment).join(', '), // Join product comments
            'Ticket Comments': ticketComments.map((comment: { comment: any; }) => comment.comment).join(', '), // Join ticket comments
            'Images': ticket.images.join(', ') // Join image URLs
          };
        });
  
        // Create a worksheet from the formatted data
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets Data');
  
        // Generate the Excel file and trigger download
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        const fileName = `tickets_data_${formattedDate}.xlsx`;
  
        XLSX.writeFile(workbook, fileName);
      },
      (error) => {
        console.error('Error exporting data:', error);
      }
    );
  }
  fetchStatusOptions() {
    this.apiService.getStatusOptions().subscribe(
      (response) => {
        this.statusOptions = response.status_options || [];
      },
      (error) => {
        console.error('Error fetching status options:', error);
      }
    );
  }
  openEditPopup(ticket: any): void {
    this.editedTicket = { ...ticket }; // Make a copy of the ticket details
    console.log('Ticket ID:', this.editedTicket.ticket_id); // Log the ticket ID
    // Display the edit popup/modal
    const editPopup = document.getElementById('editPopup');
    if (editPopup) {
        editPopup.style.display = 'block';
    }
  }
  
  // Open the comments popup for a specific ticket
  openComments(ticket_id: string) {
    const selectedTicket = this.tickets.find((ticket) => ticket.ticket_id === ticket_id);
    if (selectedTicket) {
      this.ticketDetails = {
        ...selectedTicket,
        comments: this.splitComment(selectedTicket.comment) // Parse the comments JSON
      };
      this.popupVisible = true;
    }
  }
  splitComment(commentsString: string | null): any[] {
    if (!commentsString) {
      return []; // Return an empty array if the comment is null or empty
    }
    try {
      return JSON.parse(commentsString) || [];
    } catch (error) {
      console.error('Error parsing comments JSON:', error);
      return []; // Return an empty array on parse error
    }
  }
  

 
    saveStatus(): void {
      const data = {
        ticket_id: this.editedTicket.ticket_id, // Make sure ticket_id is correctly fetched
      status: this.editedTicket.status,
       
      };
    
      this.apiService.updateStatus(data).subscribe(
        (response) => {
          this.openSnackBar('Ticket status updated successfully', 'success');
          this.closeEditPopup();
          this.fetchStatusOptions();
          window.location.reload();
      
          // Refresh ticket list or do any necessary updates
        },
        (error) => {
          console.error('Error updating ticket status:', error);
          this.openSnackBar('Failed to update ticket status', 'error');
        }
      );
    }
// Method to close edit popup
closeEditPopup(): void {
  // Close the edit popup/modal
  const editPopup = document.getElementById('editPopup');
  if (editPopup) {
      editPopup.style.display = 'none';
  }
}

isCommentBlank(): boolean {
  // Check if the comments field is blank
  return this.editedTicket.comments.trim() === '';
}

saveTicketStatus(): void {
  // Construct the data object to be sent
  const data = {
      ticket_id: this.editedTicket.ticket_id,
      product_name: this.editedTicket.product_name,
      status: this.editedTicket.status,
      comments: this.editedTicket.comments
  };

  // Call the API service to update the ticket status
  this.apiService.updateTicketStatus(data).subscribe(
      (response) => {
          // Show a success message
          this.openSnackBar('Ticket status updated successfully', 'success');
          // Close the edit popup
          this.closeEditPopup();
          // Fetch status options again
          // Clear the comments field
          this.editedTicket.comments = '';
      },
      (error) => {
          // Show an error message if updating the status fails
          console.error('Error updating ticket status:', error);
      } 
  );
}  


saveTicketAndCommentStatus(): void {
  if (!this.editedTicket.comments || this.editedTicket.comments.trim() === '') {
    alert('Comment is mandatory.');
    return; // Stop further execution if the comment is blank
  }

  // Check if the comment exceeds 20 words
  const wordCount = this.editedTicket.comments.trim().split(/\s+/).length;
  if (wordCount > 20) {
    alert('Comment must not exceed 20 words.');
    return;
  }

  const data = {
      ticket_id: this.editedTicket.ticket_id,
      status: this.editedTicket.status,
      comments: this.editedTicket.comments
  };

  // Call the API service to update the ticket status
  this.apiService.updateTicketAndCommentStatus(data).subscribe(
      (response) => {
          // Show a success message
          this.openSnackBar('Ticket status updated successfully', 'success');
          // Close the edit popup
          this.closeEditPopup();
          // Fetch status options again
          // Clear the comments field
          this.editedTicket.comments = '';
this.fetchticketlist();      },
      (error) => {
          // Show an error message if updating the status fails
          console.error('Error updating ticket status:', error);
      } 
  );
}  
  
  openSnackBar(message: string, panelClass: string) {
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = [panelClass];
    this.snackBar.open(message, 'Close', config);
  }
  filterByStatus(): void {
    console.log("Selected status:", this.selectedStatus); // Log selected status
    
    // Fetch the ticket list from the server
    this.fetchticketlist();
  
    // Subscribe to the ticket list fetching process
    this.apiService.GetTickets().subscribe(
      (response) => {
        if (response && response.tickets) {
          // Get the fetched tickets
          const fetchedTickets = response.tickets;
          
          // Filter tickets based on selected status
          const filteredTickets = fetchedTickets.filter(ticket => {
            return !this.selectedStatus || ticket.status === this.selectedStatus;
          });
  
          // Update the displayed tickets with the filtered tickets
          this.tickets = filteredTickets;
        } else {
          console.error('Failed to fetch ticket list:', response);
        }
      },
      (error) => {
        console.error('Error fetching ticket list:', error);
      }
    );
  }
  openTicketDetails(ticketId: number): void {
    this.router.navigate(['/ticket-history', ticketId]);
  }

  fetchTicketDetails(ticketId: number): void {
    this.apiService.getTicketDetails(ticketId).subscribe(
      (response) => {
        console.log('Ticket details response:', response);
        this.ticket_details = response || {};
        console.log('Ticket details:', this.ticket_details);
        this.ticket_details.updated_at = this.splitUpdatedAt(this.ticket_details.updated_at);
      },
      (error) => {
        console.error('Error fetching ticket details:', error);
      }
    );
  }
  
  splitComments(comments: string): string[] {
    return comments ? comments.split(',') : [];
  }
  
  splitUpdatedBy(updatedBy: string): string[] {
    return updatedBy ? updatedBy.split(',') : [];
  }
  
  splitUpdatedAt(updatedAt: string): string[] {
    return updatedAt ? updatedAt.split(',') : [];
  }
  
  closePopup(): void {
    this.ticket_details = {}; // Reset ticket details when closing the popup
    const popup = document.getElementById('popup');
    if (popup) {
      popup.style.display = 'none';
    }
    this.popupVisible = false;
    this.ticketDetails = null;
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

        this.router.navigate(['/'], { replaceUrl: true });
      },
      (error) => {
        console.error('Error logging out:', error);
        this.openSnackBar('You are not Logged in', 'custom-snackbar');
      }
    );
  }
  
}


    
