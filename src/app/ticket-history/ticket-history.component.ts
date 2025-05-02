import { Component, HostListener, ViewChild ,} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router'; // Import ActivatedRoute and Params
import { ApiService } from '../api.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';

interface Comment {
  product_name: string;
  comment: string;
  commented_at: string;
  owned_by: string;
}

@Component({
  selector: 'app-ticket-history',
  templateUrl: './ticket-history.component.html',
  styleUrls: ['./ticket-history.component.css']
})
export class TicketHistoryComponent {
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
  ticketId: number = 0; // Initialize ticketId
  isMobile: boolean | undefined;
  popupVisible = false;
  documentPopupVisible = false;
  fullScreenVisible = false;
  fullScreenImage: string | null = null;

  selectedProductName: string | null = null;
  company_type:  string | undefined;

  customer: string = 'Customer'; 

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) { // Explicitly specify the type of the event parameter
    this.isMobile = window.innerWidth <= 1280;
  }



 exportToExcel() {
    this.apiService.getExcelToExport().subscribe(
      (response: any) => {
        const ticketsData = response.tickets;
  
        // Transform the data into a flat structure
        const formattedData = ticketsData.map((ticket: { ticket_id: any; company_name: any; company_type: any; status: any; created_at: any; description: any; email: any; first_name: any; last_name: any; mobile: any; invoice_number: any; invoice_date: any; product_name: any[]; quantity: any[]; quantity_type: any[]; complaint_type: any[]; updated_by: any; comments: { comment: any; }[]; images: any[]; }) => {
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
            'Comments': ticket.comments.map((comment: { comment: any; }) => comment.comment).join(', '), // Join comments
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

  constructor(private apiService: ApiService, private snackBar: MatSnackBar, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.ticketId = params['id']; // No need to convert to number if it's a string
      this.fetchTicketDetails(this.ticketId);
    });
  }
 
    ngOnInit(): void {
      this.route.params.subscribe(params => {
        this.ticketId = +params['id']; // Get the ticket ID from route parameters
        this.fetchTicketDetails(this.ticketId); // Fetch ticket details
      });
      this.fetchStatusOptions(); // Fetch status options
     

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
      // Method to check if a document is an image
  isImage(document: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];
    const extension = document.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
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
  openEditPopup(ticket: any, productIndex: number): void {
    // Make sure the ticket object is defined and the product index is valid
    if (ticket && ticket.product_name && ticket.product_name[productIndex]) {
        // Assign details of the selected product to editedTicket
        this.editedTicket = { ...ticket };
        this.editedTicket.product_name = ticket.product_name[productIndex];
        this.editedTicket.quantity = ticket.quantity[productIndex];
        this.editedTicket.quantity_type = ticket.quantity_type[productIndex];
        this.editedTicket.complaint_type = ticket.complaint_type[productIndex];
        
        // Display the edit popup/modal
        const editPopup = document.getElementById('editPopup');
        if (editPopup) {
            editPopup.style.display = 'block';
            this.editedTicket.comments = '';
        }
    } else {
        console.error('Invalid ticket object or product index:', ticket, productIndex);
    }
}


saveTicketStatus(): void {
  // Construct the data object to be sent
  if (!this.editedTicket.comments || this.editedTicket.comments.trim() === '') {
    alert('Comment is mandatory.');
    return;
  }

  // Check if the comment exceeds 20 words
  const wordCount = this.editedTicket.comments.trim().split(/\s+/).length;
  if (wordCount > 20) {
    alert('Comment must not exceed 20 words.');
    return;
  }
  const data = {
      ticket_id: this.editedTicket.ticket_id,
      product_name: this.editedTicket.product_name,
      status: this.ticket_details.status,
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
      window.location.reload();
          // Clear the comments field
          this.editedTicket.comments = '';
      },
      (error) => {
          // Show an error message if updating the status fails
          console.error('Error updating ticket status:', error);
      } 
  );
}
submitForm(): void {
  // Check if both status and comments are provided
  if (this.editedTicket.status && this.editedTicket.comments) {
      // Call both API methods
      this.saveStatus();
      this.saveTicketStatus();
  }
  // Check if only status is provided
  else if (this.editedTicket.status && !this.isCommentBlank()) {
      this.saveStatus();
  }
  // Check if only comments are provided
  else if (!this.isStatusBlank() && !this.isCommentBlank()) {
      this.saveTicketStatus();
  }
  // Handle other cases as needed
}

isStatusBlank(): boolean {
  // Check if the status field is blank
  return !this.editedTicket.status;
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
      window.location.reload();

      // Refresh ticket list or do any necessary updates
    },
    (error) => {
    
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

  openTicketDetails(ticketId: number, productName: string): void {
    // Set the selected product name
    this.selectedProductName = productName;

    // Fetch product details and open the popup as before
    this.fetchProductDetails(ticketId, productName);
    this.popupVisible = true;
}
openViewDocuments(ticketId: number, productName: string): void {
  // Set the selected product name
  this.selectedProductName = productName;

  // Fetch product details and open the popup as before
  this.fetchProductDetails(ticketId, productName);
  this.documentPopupVisible = true; // Ensure this is true to show the popup
}
openFullScreen(image: string): void {
  this.fullScreenImage = image;
  this.fullScreenVisible = true;
}

closeFullScreen(): void {
  this.fullScreenVisible = false;
  this.fullScreenImage = null; // Reset the image when closing
}

closePopup(): void {
    // Reset the selected product name when the popup is closed
    this.selectedProductName = null;
    this.popupVisible = false;
    this.documentPopupVisible=false;
}
  
fetchProductDetails(ticketId: number, productName: string): void {
  this.apiService.getTicketDetails(ticketId).subscribe(
    (response) => {
      console.log('Ticket details response:', response);
      this.ticket_details = response || {};
      console.log('Ticket details:', this.ticket_details);
      
      // Split other fields as needed
      this.ticket_details.product_name = this.splitProductName(this.ticket_details.product_name);
      this.ticket_details.quantity = this.splitQuantity(this.ticket_details.quantity);
      this.ticket_details.quantity_type = this.splitQuantityType(this.ticket_details.quantity_type);
      this.ticket_details.complaint_type = this.splitComplaintType(this.ticket_details.complaint_type);
      
      // Ensure that comments is initialized
      if (this.ticket_details.comments) {
        this.ticket_details.comments = this.splitComments(this.ticket_details.comments);
      }
    },
    (error) => {
      console.error('Error fetching ticket details:', error);
    }
  );
}



  
  getCommentsForProduct(productName: string): Comment[] {
    if (!this.ticket_details.comments || !Array.isArray(this.ticket_details.comments)) {
      return [];
    }
  
    // Filter comments for the specified product
    return this.ticket_details.comments.filter((comment: Comment) => comment.product_name === productName);
  }
  
  fetchTicketDetails(ticketId: number): void {
    this.apiService.getTicketDetails(ticketId).subscribe(
      (response) => {
        console.log('Ticket details response:', response);
        this.ticket_details = response || {};
        console.log('Ticket details:', this.ticket_details);
        this.ticket_details.product_name = this.splitProductName(this.ticket_details.product_name);
        this.ticket_details.quantity = this.splitQuantity(this.ticket_details.quantity);
        this.ticket_details.quantity_type = this.splitQuantityType(this.ticket_details.quantity_type);
        this.ticket_details.complaint_type = this.splitComplaintType(this.ticket_details.complaint_type);
        this.company_type = this.ticket_details.company_type; // Set company_type from response


      },
      (error) => {
        console.error('Error fetching ticket details:', error);
      }
    );
  }
  splitComments(comments: any[]): any[] {
    const splittedComments: any[] = [];
    if (Array.isArray(comments)) {
      comments.forEach(comment => {
        if (comment && comment.comment) {
          const commentParts = comment.comment.split(',');
          const updatedAtParts = comment.updated_at ? comment.updated_at.split(',') : [];
          const updatedByParts = comment.updated_by ? comment.updated_by.split(',') : [];
          
          // Determine the maximum length among comment, updated_at, and updated_by parts
          const maxLength = Math.max(commentParts.length, updatedAtParts.length, updatedByParts.length);
  
          // Ensure that each comment is associated with at least one updated_at and updated_by value
          for (let i = 0; i < maxLength; i++) {
            const newCommentObj = {
              product_name: comment.product_name,
              comment: commentParts[i] ? commentParts[i].trim() : '',
              commented_at: comment.commented_at,
              owned_by: comment.owned_by,
              updated_at: updatedAtParts[i] ? updatedAtParts[i].trim() : null,
              updated_by: updatedByParts[i] ? updatedByParts[i].trim() : null
            };
            splittedComments.push(newCommentObj);
          }
        }
      });
    }
    return splittedComments;
  }
  


  isCommentBlank(): boolean {
    // Check if the comments field is blank
    return this.editedTicket.comments.trim() === '';
}

splitUpdatedBy(updatedBy: string | string[]): string[] {
  if (typeof updatedBy === 'string') {
    return updatedBy.split(',');
  } else if (Array.isArray(updatedBy)) {
    return updatedBy;
  } else {
    return [];
  }
}

  splitProductName(productName: string[]): string[] {
    if (!productName || productName.length === 0) {
        return [];
    }
  
    // Join array elements into a single string
    const joinedString = productName.join(',');
  
    // Split the string by ',' but ignore commas within double quotes
    const trimmed = joinedString.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(name => name.trim());
  
    return trimmed;
}


  splitUpdatedAt(updatedAt: string): string[] {
    return updatedAt ? updatedAt.split(',') : [];
  } 
  
  splitQuantity(quantity: any[]): string[] {
    // Check if quantity is an array
    if (Array.isArray(quantity)) {
      // Map the elements of the array
      return quantity.map(item => {
        // Convert to string if it's not already a string
        return typeof item === 'string' ? item : item.toString();
      });
    } else {
      // Handle other types as needed
      return [];
    }
  }
  
  splitQuantityType(quantitytype: any): string[] {
    if (Array.isArray(quantitytype)) {
      // Join the array elements into a single string
      const joinedString = quantitytype.join(',');
      // Split the string by ',' and return the array
      return joinedString.split(',');
    } else if (typeof quantitytype === 'string') {
      // Split the string by ',' and return the array
      return quantitytype.split(',');
    } else {
      // Handle other types or unexpected cases
      console.error('Invalid quantity type:', quantitytype);
      return [];
    }
  }
  
  splitComplaintType(complainttype: any): string[] {
    // Check if complainttype is a string
    if (typeof complainttype === 'string') {
      return complainttype.split(',');
    } else if (Array.isArray(complainttype)) {
      // If it's an array, join the elements and split
      return complainttype.join(',').split(',');
    } else {
      // Handle other types or unexpected cases
      console.error('Invalid complaint type:', complainttype);
      return [];
    }
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


    
