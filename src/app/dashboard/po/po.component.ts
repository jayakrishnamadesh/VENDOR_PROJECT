import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PoService } from './po.service';
import { PurchaseOrder } from '../../shared/models/vendor.model';

@Component({
  selector: 'app-po',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="po-container">
      <div class="po-header">
        <h1>Purchase Orders</h1>
        <p>View and manage your purchase orders</p>
      </div>

      <div class="filters">
        <div class="filter-group">
          <select [(ngModel)]="selectedStatus" (change)="filterPOs()" class="form-control">
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Partially Delivered">Partially Delivered</option>
            <option value="Delivered">Delivered</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <button class="btn btn-primary" (click)="loadPOs()">
          <i class="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>Loading Purchase Orders...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && filteredPOs.length === 0" class="empty-state">
        <i class="fas fa-shopping-cart"></i>
        <h3>No Purchase Orders Found</h3>
        <p>There are no purchase orders matching your criteria at the moment.</p>
      </div>

      <div *ngIf="filteredPOs.length > 0" class="po-list">
        <div class="po-card" *ngFor="let po of filteredPOs">
          <div class="po-header-info">
            <div class="po-title">
              <h3>{{ po.poNumber }}</h3>
              <span class="status-badge" [ngClass]="getStatusClass(po.status)">
                {{ po.status }}
              </span>
            </div>
            <div class="po-amount">
              <strong>{{ po.totalAmount | currency:po.currency }}</strong>
            </div>
          </div>

          <div class="po-details">
            <p><strong>Description:</strong> {{ po.description }}</p>
            <div class="po-dates">
              <div class="date-info">
                <i class="fas fa-calendar-plus"></i>
                <span>Order Date: {{ po.orderDate | date:'medium' }}</span>
              </div>
              <div class="date-info">
                <i class="fas fa-truck"></i>
                <span>Delivery Date: {{ po.deliveryDate | date:'medium' }}</span>
              </div>
            </div>
          </div>

          <div class="po-items" *ngIf="po.items && po.items.length > 0">
            <h4>Items ({{ po.items.length }})</h4>
            <div class="items-summary">
              <div class="item-preview" *ngFor="let item of po.items.slice(0, 3)">
                <span class="item-desc">{{ item.description }}</span>
                <span class="item-status">
                  {{ item.deliveredQty }}/{{ item.quantity }} {{ item.unit }}
                </span>
              </div>
              <div *ngIf="po.items.length > 3" class="more-items">
                +{{ po.items.length - 3 }} more items
              </div>
            </div>
          </div>

          <div class="po-actions">
            <button class="btn btn-primary" (click)="viewPODetails(po)">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button 
              class="btn btn-success" 
              *ngIf="po.status === 'Confirmed' || po.status === 'Partially Delivered'"
              (click)="acknowledgePO(po)"
            >
              <i class="fas fa-check"></i>
              Acknowledge
            </button>
            <button class="btn btn-secondary" (click)="downloadPO(po)">
              <i class="fas fa-download"></i>
              Download
            </button>
          </div>
        </div>
      </div>

      <!-- PO Details Modal -->
      <div *ngIf="selectedPO" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedPO.poNumber }} - Details</h2>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="po-detail-section">
              <h3>General Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>PO Number:</label>
                  <span>{{ selectedPO.poNumber }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" [ngClass]="getStatusClass(selectedPO.status)">
                    {{ selectedPO.status }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Order Date:</label>
                  <span>{{ selectedPO.orderDate | date:'medium' }}</span>
                </div>
                <div class="detail-item">
                  <label>Delivery Date:</label>
                  <span>{{ selectedPO.deliveryDate | date:'medium' }}</span>
                </div>
                <div class="detail-item">
                  <label>Total Amount:</label>
                  <span>{{ selectedPO.totalAmount | currency:selectedPO.currency }}</span>
                </div>
                <div class="detail-item">
                  <label>Currency:</label>
                  <span>{{ selectedPO.currency }}</span>
                </div>
              </div>
              <div class="detail-item full-width">
                <label>Description:</label>
                <p>{{ selectedPO.description }}</p>
              </div>
            </div>

            <div class="po-detail-section" *ngIf="selectedPO.items">
              <h3>Items</h3>
              <div class="items-table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Material ID</th>
                      <th>Description</th>
                      <th>Ordered Qty</th>
                      <th>Delivered Qty</th>
                      <th>Pending Qty</th>
                      <th>Unit</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedPO.items">
                      <td>{{ item.materialId }}</td>
                      <td>{{ item.description }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.deliveredQty }}</td>
                      <td>{{ item.pendingQty }}</td>
                      <td>{{ item.unit }}</td>
                      <td>{{ item.unitPrice | currency:selectedPO.currency }}</td>
                      <td>{{ item.totalPrice | currency:selectedPO.currency }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Close</button>
            <button class="btn btn-primary" (click)="downloadPO(selectedPO)">
              <i class="fas fa-download"></i>
              Download PO
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .po-container {
      padding: 20px;
    }

    .po-header {
      margin-bottom: 30px;
    }

    .po-header h1 {
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

    .po-list {
      display: grid;
      gap: 20px;
    }

    .po-card {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .po-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .po-header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .po-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .po-title h3 {
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
    .status-badge.confirmed { background: #fff3e0; color: #f57c00; }
    .status-badge.partially-delivered { background: #f3e5f5; color: #7b1fa2; }
    .status-badge.delivered { background: #e8f5e8; color: #388e3c; }
    .status-badge.closed { background: #f5f5f5; color: #616161; }

    .po-amount {
      font-size: 18px;
      color: #2c3e50;
    }

    .po-details p {
      color: #555;
      margin-bottom: 15px;
      line-height: 1.6;
    }

    .po-dates {
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

    .po-items {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .po-items h4 {
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

    .item-status {
      color: #7f8c8d;
    }

    .more-items {
      color: #7f8c8d;
      font-style: italic;
      text-align: center;
      padding: 5px;
    }

    .po-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }

    .po-actions .btn {
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

    .po-detail-section {
      margin-bottom: 30px;
    }

    .po-detail-section h3 {
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

      .po-header-info {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .po-dates {
        flex-direction: column;
        gap: 10px;
      }

      .po-actions {
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
export class PoComponent implements OnInit {
  pos: PurchaseOrder[] = [];
  filteredPOs: PurchaseOrder[] = [];
  selectedPO: PurchaseOrder | null = null;
  selectedStatus = '';
  isLoading = false;
  errorMessage = '';

  constructor(private poService: PoService) {}

  ngOnInit() {
    this.loadPOs();
  }

  loadPOs() {
    this.isLoading = true;
    this.errorMessage = '';

    this.poService.getPurchaseOrders().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.pos = response.data;
          this.filterPOs();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load Purchase Orders. Please try again.';
        console.error('PO load error:', error);
      }
    });
  }

  filterPOs() {
    if (this.selectedStatus) {
      this.filteredPOs = this.pos.filter(po => 
        po.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    } else {
      this.filteredPOs = [...this.pos];
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  viewPODetails(po: PurchaseOrder) {
    this.selectedPO = po;
  }

  closeModal() {
    this.selectedPO = null;
  }

  acknowledgePO(po: PurchaseOrder) {
    console.log('Acknowledging PO:', po.poNumber);
    // Implement acknowledgment logic
  }

  downloadPO(po: PurchaseOrder) {
    console.log('Downloading PO:', po.poNumber);
    // Implement download logic
  }
}