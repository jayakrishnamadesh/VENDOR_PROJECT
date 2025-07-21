import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from './payment.service';
import { Payment } from '../../shared/models/vendor.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-container">
      <div class="payment-header">
        <h1>Payments</h1>
        <p>Track your payment history and status</p>
      </div>

      <div class="payment-summary">
        <div class="summary-card">
          <div class="summary-icon received">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="summary-info">
            <h3>{{ paymentSummary.totalReceived | currency }}</h3>
            <p>Total Received</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <div class="summary-info">
            <h3>{{ paymentSummary.totalPending | currency }}</h3>
            <p>Pending Payments</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon count">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="summary-info">
            <h3>{{ paymentSummary.totalPayments }}</h3>
            <p>Total Payments</p>
          </div>
        </div>
      </div>

      <div class="filters">
        <div class="filter-group">
          <select [(ngModel)]="selectedStatus" (change)="filterPayments()" class="form-control">
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
          </select>
          
          <select [(ngModel)]="selectedMethod" (change)="filterPayments()" class="form-control">
            <option value="">All Methods</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="ACH">ACH</option>
          </select>
        </div>
        <button class="btn btn-primary" (click)="loadPayments()">
          <i class="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>Loading Payments...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && filteredPayments.length === 0" class="empty-state">
        <i class="fas fa-credit-card"></i>
        <h3>No Payments Found</h3>
        <p>There are no payments matching your criteria at the moment.</p>
      </div>

      <div *ngIf="filteredPayments.length > 0" class="payment-list">
        <div class="payment-card" *ngFor="let payment of filteredPayments">
          <div class="payment-header-info">
            <div class="payment-title">
              <h3>{{ payment.referenceNumber }}</h3>
              <span class="status-badge" [ngClass]="getStatusClass(payment.status)">
                {{ payment.status }}
              </span>
            </div>
            <div class="payment-amount">
              <strong>{{ payment.amount | currency:payment.currency }}</strong>
            </div>
          </div>

          <div class="payment-details">
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-file-invoice"></i>
                <span>Invoice: {{ payment.invoiceId }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>Date: {{ payment.paymentDate | date:'medium' }}</span>
              </div>
            </div>
            
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-university"></i>
                <span>Method: {{ payment.paymentMethod }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-money-bill"></i>
                <span>Currency: {{ payment.currency }}</span>
              </div>
            </div>
          </div>

          <div class="payment-actions">
            <button class="btn btn-primary" (click)="viewPaymentDetails(payment)">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button 
              class="btn btn-secondary" 
              *ngIf="payment.status === 'Completed'"
              (click)="downloadReceipt(payment)"
            >
              <i class="fas fa-download"></i>
              Receipt
            </button>
            <button 
              class="btn btn-warning" 
              *ngIf="payment.status === 'Failed'"
              (click)="retryPayment(payment)"
            >
              <i class="fas fa-redo"></i>
              Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Details Modal -->
      <div *ngIf="selectedPayment" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Payment Details - {{ selectedPayment.referenceNumber }}</h2>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="payment-detail-section">
              <h3>Payment Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Reference Number:</label>
                  <span>{{ selectedPayment.referenceNumber }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" [ngClass]="getStatusClass(selectedPayment.status)">
                    {{ selectedPayment.status }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Payment Date:</label>
                  <span>{{ selectedPayment.paymentDate | date:'medium' }}</span>
                </div>
                <div class="detail-item">
                  <label>Amount:</label>
                  <span class="amount">{{ selectedPayment.amount | currency:selectedPayment.currency }}</span>
                </div>
                <div class="detail-item">
                  <label>Currency:</label>
                  <span>{{ selectedPayment.currency }}</span>
                </div>
                <div class="detail-item">
                  <label>Payment Method:</label>
                  <span>{{ selectedPayment.paymentMethod }}</span>
                </div>
              </div>
            </div>

            <div class="payment-detail-section">
              <h3>Invoice Information</h3>
              <div class="invoice-info">
                <div class="detail-item">
                  <label>Invoice ID:</label>
                  <span>{{ selectedPayment.invoiceId }}</span>
                </div>
              </div>
            </div>

            <div class="payment-detail-section" *ngIf="selectedPayment.status === 'Completed'">
              <h3>Payment Confirmation</h3>
              <div class="confirmation-info">
                <div class="success-message">
                  <i class="fas fa-check-circle"></i>
                  <span>Payment has been successfully processed and confirmed.</span>
                </div>
              </div>
            </div>

            <div class="payment-detail-section" *ngIf="selectedPayment.status === 'Failed'">
              <h3>Payment Status</h3>
              <div class="failure-info">
                <div class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  <span>Payment processing failed. Please contact support or try again.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Close</button>
            <button 
              class="btn btn-primary" 
              *ngIf="selectedPayment.status === 'Completed'"
              (click)="downloadReceipt(selectedPayment)"
            >
              <i class="fas fa-download"></i>
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      padding: 20px;
    }

    .payment-header {
      margin-bottom: 30px;
    }

    .payment-header h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
    }

    .payment-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .summary-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
    }

    .summary-icon.received { background: linear-gradient(135deg, #27ae60, #229954); }
    .summary-icon.pending { background: linear-gradient(135deg, #f39c12, #e67e22); }
    .summary-icon.count { background: linear-gradient(135deg, #3498db, #2980b9); }

    .summary-info h3 {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin: 0;
    }

    .summary-info p {
      color: #7f8c8d;
      margin: 5px 0 0;
      font-size: 14px;
    }

    .filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .filter-group {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .filter-group select {
      min-width: 150px;
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

    .payment-list {
      display: grid;
      gap: 20px;
    }

    .payment-card {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .payment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .payment-header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .payment-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .payment-title h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 18px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.completed { background: #e8f5e8; color: #388e3c; }
    .status-badge.pending { background: #fff3e0; color: #f57c00; }
    .status-badge.processing { background: #e3f2fd; color: #1976d2; }
    .status-badge.failed { background: #ffebee; color: #d32f2f; }

    .payment-amount {
      font-size: 20px;
      color: #27ae60;
      font-weight: bold;
    }

    .payment-details {
      margin-bottom: 20px;
    }

    .detail-row {
      display: flex;
      gap: 40px;
      margin-bottom: 15px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #7f8c8d;
      font-size: 14px;
    }

    .detail-item i {
      color: #27ae60;
      width: 16px;
    }

    .payment-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }

    .payment-actions .btn {
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
      max-width: 700px;
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
      font-size: 20px;
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

    .payment-detail-section {
      margin-bottom: 30px;
    }

    .payment-detail-section h3 {
      color: #2c3e50;
      margin-bottom: 20px;
      font-size: 18px;
      border-bottom: 2px solid #27ae60;
      padding-bottom: 8px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
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

    .detail-item .amount {
      font-weight: bold;
      color: #27ae60;
      font-size: 16px;
    }

    .invoice-info, .confirmation-info, .failure-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
    }

    .success-message, .error-message {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .success-message {
      color: #27ae60;
    }

    .success-message i {
      font-size: 20px;
    }

    .error-message {
      color: #e74c3c;
    }

    .error-message i {
      font-size: 20px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      padding: 20px 30px;
      border-top: 1px solid #e1e8ed;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .filter-group {
        flex-direction: column;
      }

      .payment-header-info {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .detail-row {
        flex-direction: column;
        gap: 10px;
      }

      .payment-actions {
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
export class PaymentComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  selectedPayment: Payment | null = null;
  selectedStatus = '';
  selectedMethod = '';
  isLoading = false;
  errorMessage = '';

  paymentSummary = {
    totalReceived: 0,
    totalPending: 0,
    totalPayments: 0
  };

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getPayments().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.payments = response.data;
          this.calculateSummary();
          this.filterPayments();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load Payments. Please try again.';
        console.error('Payment load error:', error);
      }
    });
  }

  calculateSummary() {
    this.paymentSummary = {
      totalReceived: this.payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + p.amount, 0),
      totalPending: this.payments
        .filter(p => p.status === 'Pending' || p.status === 'Processing')
        .reduce((sum, p) => sum + p.amount, 0),
      totalPayments: this.payments.length
    };
  }

  filterPayments() {
    let filtered = [...this.payments];

    if (this.selectedStatus) {
      filtered = filtered.filter(payment => 
        payment.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }

    if (this.selectedMethod) {
      filtered = filtered.filter(payment => 
        payment.paymentMethod.toLowerCase() === this.selectedMethod.toLowerCase()
      );
    }

    this.filteredPayments = filtered;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  viewPaymentDetails(payment: Payment) {
    this.selectedPayment = payment;
  }

  closeModal() {
    this.selectedPayment = null;
  }

  downloadReceipt(payment: Payment) {
    console.log('Downloading receipt for payment:', payment.referenceNumber);
    // Implement download receipt logic
  }

  retryPayment(payment: Payment) {
    console.log('Retrying payment:', payment.referenceNumber);
    // Implement retry payment logic
  }
}