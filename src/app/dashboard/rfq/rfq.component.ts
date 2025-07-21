import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RfqService } from './rfq.service';
import { RFQ } from '../../shared/models/vendor.model';

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rfq-container">
      <div class="rfq-header">
        <h1>Request for Quotations (RFQ)</h1>
        <p>View and respond to quotation requests</p>
      </div>

      <div class="filters">
        <div class="filter-group">
          <select [(ngModel)]="selectedStatus" (change)="filterRFQs()" class="form-control">
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Awarded">Awarded</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button class="btn btn-primary" (click)="loadRFQs()">
          <i class="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>Loading RFQs...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && filteredRFQs.length === 0" class="empty-state">
        <i class="fas fa-file-invoice"></i>
        <h3>No RFQs Found</h3>
        <p>There are no RFQs matching your criteria at the moment.</p>
      </div>

      <div *ngIf="filteredRFQs.length > 0" class="rfq-list">
        <div class="rfq-card" *ngFor="let rfq of filteredRFQs">
          <div class="rfq-header-info">
            <div class="rfq-title">
              <h3>{{ rfq.rfqNumber }}</h3>
              <span class="status-badge" [ngClass]="getStatusClass(rfq.status)">
                {{ rfq.status }}
              </span>
            </div>
            <div class="rfq-amount">
              <strong>{{ rfq.totalAmount | currency:rfq.currency }}</strong>
            </div>
          </div>

          <div class="rfq-details">
            <p><strong>Description:</strong> {{ rfq.description }}</p>
            <div class="rfq-dates">
              <div class="date-info">
                <i class="fas fa-calendar-plus"></i>
                <span>Request Date: {{ rfq.requestDate | date:'medium' }}</span>
              </div>
              <div class="date-info">
                <i class="fas fa-calendar-times"></i>
                <span>Due Date: {{ rfq.dueDate | date:'medium' }}</span>
              </div>
            </div>
          </div>

          <div class="rfq-items" *ngIf="rfq.items && rfq.items.length > 0">
            <h4>Items ({{ rfq.items.length }})</h4>
            <div class="items-summary">
              <div class="item-preview" *ngFor="let item of rfq.items.slice(0, 3)">
                <span class="item-desc">{{ item.description }}</span>
                <span class="item-qty">Qty: {{ item.quantity }} {{ item.unit }}</span>
              </div>
              <div *ngIf="rfq.items.length > 3" class="more-items">
                +{{ rfq.items.length - 3 }} more items
              </div>
            </div>
          </div>

          <div class="rfq-actions">
            <button 
              class="btn btn-primary" 
              *ngIf="rfq.status === 'Open'"
              (click)="viewRFQDetails(rfq)"
            >
              <i class="fas fa-eye"></i>
              View & Quote
            </button>
            <button 
              class="btn btn-success" 
              *ngIf="rfq.status === 'Submitted'"
              (click)="viewRFQDetails(rfq)"
            >
              <i class="fas fa-check-circle"></i>
              View Submitted
            </button>
            <button 
              class="btn btn-warning" 
              *ngIf="rfq.status === 'In Progress'"
              (click)="viewRFQDetails(rfq)"
            >
              <i class="fas fa-edit"></i>
              Continue
            </button>
            <button 
              class="btn btn-secondary" 
              (click)="viewRFQDetails(rfq)"
            >
              <i class="fas fa-file-alt"></i>
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- RFQ Details Modal -->
      <div *ngIf="selectedRFQ" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedRFQ.rfqNumber }} - Details</h2>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="rfq-detail-section">
              <h3>General Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>RFQ Number:</label>
                  <span>{{ selectedRFQ.rfqNumber }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" [ngClass]="getStatusClass(selectedRFQ.status)">
                    {{ selectedRFQ.status }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Request Date:</label>
                  <span>{{ selectedRFQ.requestDate | date:'medium' }}</span>
                </div>
                <div class="detail-item">
                  <label>Due Date:</label>
                  <span>{{ selectedRFQ.dueDate | date:'medium' }}</span>
                </div>
              </div>
              <div class="detail-item full-width">
                <label>Description:</label>
                <p>{{ selectedRFQ.description }}</p>
              </div>
            </div>

            <div class="rfq-detail-section" *ngIf="selectedRFQ.items">
              <h3>Items</h3>
              <div class="items-table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Material ID</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedRFQ.items">
                      <td>{{ item.materialId }}</td>
                      <td>{{ item.description }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.unit }}</td>
                      <td>{{ item.unitPrice | currency:selectedRFQ.currency }}</td>
                      <td>{{ item.totalPrice | currency:selectedRFQ.currency }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Close</button>
            <button 
              class="btn btn-primary" 
              *ngIf="selectedRFQ.status === 'Open'"
              (click)="submitQuotation(selectedRFQ)"
            >
              <i class="fas fa-paper-plane"></i>
              Submit Quotation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rfq-container {
      padding: 20px;
    }

    .rfq-header {
      margin-bottom: 30px;
    }

    .rfq-header h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
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

    .rfq-list {
      display: grid;
      gap: 20px;
    }

    .rfq-card {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .rfq-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .rfq-header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .rfq-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .rfq-title h3 {
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

    .status-badge.open { background: #e3f2fd; color: #1976d2; }
    .status-badge.in-progress { background: #fff3e0; color: #f57c00; }
    .status-badge.submitted { background: #e8f5e8; color: #388e3c; }
    .status-badge.awarded { background: #e8f5e8; color: #4caf50; }
    .status-badge.rejected { background: #ffebee; color: #d32f2f; }

    .rfq-amount {
      font-size: 18px;
      color: #2c3e50;
    }

    .rfq-details p {
      color: #555;
      margin-bottom: 15px;
      line-height: 1.6;
    }

    .rfq-dates {
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
      color: #3498db;
    }

    .rfq-items {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .rfq-items h4 {
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

    .item-qty {
      color: #7f8c8d;
    }

    .more-items {
      color: #7f8c8d;
      font-style: italic;
      text-align: center;
      padding: 5px;
    }

    .rfq-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }

    .rfq-actions .btn {
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
      max-width: 800px;
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

    .rfq-detail-section {
      margin-bottom: 30px;
    }

    .rfq-detail-section h3 {
      color: #2c3e50;
      margin-bottom: 20px;
      font-size: 18px;
      border-bottom: 2px solid #3498db;
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

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-item label {
      font-weight: 600;
      color: #7f8c8d;
      font-size: 12px;
      text-transform: uppercase;
    }

    .detail-item span, .detail-item p {
      color: #2c3e50;
      font-size: 14px;
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
      .filters {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .rfq-header-info {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .rfq-dates {
        flex-direction: column;
        gap: 10px;
      }

      .rfq-actions {
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
export class RfqComponent implements OnInit {
  rfqs: RFQ[] = [];
  filteredRFQs: RFQ[] = [];
  selectedRFQ: RFQ | null = null;
  selectedStatus = '';
  isLoading = false;
  errorMessage = '';

  constructor(private rfqService: RfqService) {}

  ngOnInit() {
    this.loadRFQs();
  }

  loadRFQs() {
    this.isLoading = true;
    this.errorMessage = '';

    this.rfqService.getRFQs().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.rfqs = response.data;
          this.filterRFQs();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load RFQs. Please try again.';
        console.error('RFQ load error:', error);
      }
    });
  }

  filterRFQs() {
    if (this.selectedStatus) {
      this.filteredRFQs = this.rfqs.filter(rfq => 
        rfq.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    } else {
      this.filteredRFQs = [...this.rfqs];
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  viewRFQDetails(rfq: RFQ) {
    this.selectedRFQ = rfq;
  }

  closeModal() {
    this.selectedRFQ = null;
  }

  submitQuotation(rfq: RFQ) {
    // Implement quotation submission logic
    console.log('Submitting quotation for RFQ:', rfq.rfqNumber);
    this.closeModal();
    // Show success message or navigate to quotation form
  }
}