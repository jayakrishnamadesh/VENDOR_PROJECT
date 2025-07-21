import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from './invoice.service';
import { Invoice } from '../../shared/models/vendor.model';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="invoice-container">
      <div class="invoice-header">
        <h1>Invoices</h1>
        <p>Manage your invoices and track payment status</p>
      </div>

      <div class="invoice-actions">
        <div class="filters">
          <select [(ngModel)]="selectedStatus" (change)="filterInvoices()" class="form-control">
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div class="action-buttons">
          <button class="btn btn-success" (click)="createInvoice()">
            <i class="fas fa-plus"></i>
            Create Invoice
          </button>
          <button class="btn btn-primary" (click)="loadInvoices()">
            <i class="fas fa-refresh"></i>
            Refresh
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>Loading Invoices...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && filteredInvoices.length === 0" class="empty-state">
        <i class="fas fa-file-invoice-dollar"></i>
        <h3>No Invoices Found</h3>
        <p>There are no invoices matching your criteria at the moment.</p>
      </div>

      <div *ngIf="filteredInvoices.length > 0" class="invoice-list">
        <div class="invoice-card" *ngFor="let invoice of filteredInvoices">
          <div class="invoice-header-info">
            <div class="invoice-title">
              <h3>{{ invoice.invoiceNumber }}</h3>
              <span class="status-badge" [ngClass]="getStatusClass(invoice.status)">
                {{ invoice.status }}
              </span>
            </div>
            <div class="invoice-amount">
              <div class="amount-info">
                <span class="total-amount">{{ invoice.totalAmount | currency:invoice.currency }}</span>
                <span class="pending-amount" *ngIf="invoice.pendingAmount > 0">
                  Pending: {{ invoice.pendingAmount | currency:invoice.currency }}
                </span>
              </div>
            </div>
          </div>

          <div class="invoice-details">
            <div class="invoice-dates">
              <div class="date-info">
                <i class="fas fa-calendar-plus"></i>
                <span>Invoice Date: {{ invoice.invoiceDate | date:'medium' }}</span>
              </div>
              <div class="date-info">
                <i class="fas fa-calendar-times"></i>
                <span>Due Date: {{ invoice.dueDate | date:'medium' }}</span>
              </div>
            </div>
            
            <div class="payment-progress" *ngIf="invoice.totalAmount > 0">
              <div class="progress-info">
                <span>Payment Progress</span>
                <span>{{ getPaymentPercentage(invoice) }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" 
                     [style.width.%]="getPaymentPercentage(invoice)">
                </div>
              </div>
            </div>
          </div>

          <div class="invoice-items" *ngIf="invoice.items && invoice.items.length > 0">
            <h4>Items ({{ invoice.items.length }})</h4>
            <div class="items-summary">
              <div class="item-preview" *ngFor="let item of invoice.items.slice(0, 3)">
                <span class="item-desc">{{ item.description }}</span>
                <span class="item-amount">{{ item.totalPrice | currency:invoice.currency }}</span>
              </div>
              <div *ngIf="invoice.items.length > 3" class="more-items">
                +{{ invoice.items.length - 3 }} more items
              </div>
            </div>
          </div>

          <div class="invoice-actions">
            <button class="btn btn-primary" (click)="viewInvoiceDetails(invoice)">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button 
              class="btn btn-warning" 
              *ngIf="invoice.status === 'Draft'"
              (click)="editInvoice(invoice)"
            >
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button 
              class="btn btn-success" 
              *ngIf="invoice.status === 'Draft'"
              (click)="submitInvoice(invoice)"
            >
              <i class="fas fa-paper-plane"></i>
              Submit
            </button>
            <button class="btn btn-secondary" (click)="downloadInvoice(invoice)">
              <i class="fas fa-download"></i>
              Download
            </button>
          </div>
        </div>
      </div>

      <!-- Invoice Details Modal -->
      <div *ngIf="selectedInvoice" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedInvoice.invoiceNumber }} - Details</h2>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="invoice-detail-section">
              <h3>Invoice Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Invoice Number:</label>
                  <span>{{ selectedInvoice.invoiceNumber }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" [ngClass]="getStatusClass(selectedInvoice.status)">
                    {{ selectedInvoice.status }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Invoice Date:</label>
                  <span>{{ selectedInvoice.invoiceDate | date:'medium' }}</span>
                </div>
                <div class="detail-item">
                  <label>Due Date:</label>
                  <span>{{ selectedInvoice.dueDate | date:'medium' }}</span>
                </div>
                <div class="detail-item">
                  <label>PO Reference:</label>
                  <span>{{ selectedInvoice.poId }}</span>
                </div>
                <div class="detail-item">
                  <label>Currency:</label>
                  <span>{{ selectedInvoice.currency }}</span>
                </div>
              </div>
            </div>

            <div class="invoice-detail-section">
              <h3>Payment Summary</h3>
              <div class="payment-summary">
                <div class="summary-item">
                  <label>Total Amount:</label>
                  <span class="amount">{{ selectedInvoice.totalAmount | currency:selectedInvoice.currency }}</span>
                </div>
                <div class="summary-item">
                  <label>Paid Amount:</label>
                  <span class="amount paid">{{ selectedInvoice.paidAmount | currency:selectedInvoice.currency }}</span>
                </div>
                <div class="summary-item">
                  <label>Pending Amount:</label>
                  <span class="amount pending">{{ selectedInvoice.pendingAmount | currency:selectedInvoice.currency }}</span>
                </div>
              </div>
            </div>

            <div class="invoice-detail-section" *ngIf="selectedInvoice.items">
              <h3>Line Items</h3>
              <div class="items-table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                      <th>Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedInvoice.items">
                      <td>{{ item.description }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.unitPrice | currency:selectedInvoice.currency }}</td>
                      <td>{{ item.totalPrice | currency:selectedInvoice.currency }}</td>
                      <td>{{ item.taxAmount | currency:selectedInvoice.currency }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Close</button>
            <button class="btn btn-primary" (click)="downloadInvoice(selectedInvoice)">
              <i class="fas fa-download"></i>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invoice-container {
      padding: 20px;
    }

    .invoice-header {
      margin-bottom: 30px;
    }

    .invoice-header h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
    }

    .invoice-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .filters select {
      min-width: 150px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
    }

    .loading-message {
      text-align: center;
      padding: 40px;
      color: #7f8c8d;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #7f8c8d;
    }

    .empty-state i {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .invoice-list {
      display: grid;
      gap: 20px;
    }

    .invoice-card {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .invoice-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .invoice-header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .invoice-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .invoice-title h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 20px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.draft { background: #f5f5f5; color: #616161; }
    .status-badge.submitted { background: #e3f2fd; color: #1976d2; }
    .status-badge.approved { background: #fff3e0; color: #f57c00; }
    .status-badge.paid { background: #e8f5e8; color: #388e3c; }
    .status-badge.rejected { background: #ffebee; color: #d32f2f; }

    .amount-info {
      text-align: right;
    }

    .total-amount {
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
      display: block;
    }

    .pending-amount {
      font-size: 12px;
      color: #e74c3c;
      display: block;
      margin-top: 5px;
    }

    .invoice-dates {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
    }

    .date-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #7f8c8d;
      font-size: 14px;
    }

    .date-info i {
      color: #e74c3c;
    }

    .payment-progress {
      margin: 20px 0;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #7f8c8d;
    }

    .progress-bar {
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #27ae60, #2ecc71);
      transition: width 0.3s ease;
    }

    .invoice-items {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .invoice-items h4 {
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .items-summary {
      display: grid;
      gap: 10px;
    }

    .item-preview {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: white;
      border-radius: 4px;
      font-size: 14px;
    }

    .item-desc {
      color: #2c3e50;
      font-weight: 500;
    }

    .item-amount {
      color: #7f8c8d;
    }

    .more-items {
      color: #7f8c8d;
      font-style: italic;
      text-align: center;
      padding: 5px;
    }

    .invoice-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
      flex-wrap: wrap;
    }

    .invoice-actions .btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 1px solid #e1e8ed;
    }

    .modal-header h2 {
      color: #2c3e50;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      color: #7f8c8d;
      cursor: pointer;
      padding: 5px;
    }

    .close-btn:hover {
      color: #2c3e50;
    }

    .modal-body {
      padding: 30px;
    }

    .invoice-detail-section {
      margin-bottom: 30px;
    }

    .invoice-detail-section h3 {
      color: #2c3e50;
      margin-bottom: 20px;
      font-size: 18px;
      border-bottom: 2px solid #e74c3c;
      padding-bottom: 8px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .detail-item label {
      font-weight: 600;
      color: #7f8c8d;
      font-size: 12px;
      text-transform: uppercase;
    }

    .detail-item span {
      color: #2c3e50;
      font-size: 14px;
    }

    .payment-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e1e8ed;
    }

    .summary-item:last-child {
      border-bottom: none;
      font-weight: bold;
    }

    .summary-item label {
      color: #7f8c8d;
    }

    .summary-item .amount {
      font-weight: 600;
    }

    .summary-item .amount.paid {
      color: #27ae60;
    }

    .summary-item .amount.pending {
      color: #e74c3c;
    }

    .items-table {
      overflow-x: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      padding: 20px 30px;
      border-top: 1px solid #e1e8ed;
    }

    @media (max-width: 768px) {
      .invoice-actions {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .action-buttons {
        flex-direction: column;
      }

      .invoice-header-info {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .invoice-dates {
        flex-direction: column;
        gap: 10px;
      }

      .invoice-actions {
        flex-direction: column;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        width: 95%;
        margin: 20px;
      }
    }
  `]
})
export class InvoiceComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;
  selectedStatus = '';
  isLoading = false;
  errorMessage = '';

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoices().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.invoices = response.data;
          this.filterInvoices();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load Invoices. Please try again.';
        console.error('Invoice load error:', error);
      }
    });
  }

  filterInvoices() {
    if (this.selectedStatus) {
      this.filteredInvoices = this.invoices.filter(invoice => 
        invoice.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    } else {
      this.filteredInvoices = [...this.invoices];
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getPaymentPercentage(invoice: Invoice): number {
    if (invoice.totalAmount === 0) return 0;
    return Math.round((invoice.paidAmount / invoice.totalAmount) * 100);
  }

  viewInvoiceDetails(invoice: Invoice) {
    this.selectedInvoice = invoice;
  }

  closeModal() {
    this.selectedInvoice = null;
  }

  createInvoice() {
    console.log('Creating new invoice');
    // Implement create invoice logic
  }

  editInvoice(invoice: Invoice) {
    console.log('Editing invoice:', invoice.invoiceNumber);
    // Implement edit invoice logic
  }

  submitInvoice(invoice: Invoice) {
    console.log('Submitting invoice:', invoice.invoiceNumber);
    // Implement submit invoice logic
  }

  downloadInvoice(invoice: Invoice) {
    console.log('Downloading invoice:', invoice.invoiceNumber);
    // Implement download logic
  }
}