import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrService } from './gr.service';
import { GoodsReceipt } from '../../shared/models/vendor.model';

@Component({
  selector: 'app-gr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gr-container">
      <div class="gr-header">
        <h1>Goods Receipt</h1>
        <p>Track goods receipt and delivery confirmations</p>
      </div>

      <div class="filters">
        <div class="filter-group">
          <select [(ngModel)]="selectedStatus" (change)="filterGRs()" class="form-control">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Received">Received</option>
            <option value="Posted">Posted</option>
          </select>
        </div>
        <button class="btn btn-primary" (click)="loadGRs()">
          <i class="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>Loading Goods Receipts...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && filteredGRs.length === 0" class="empty-state">
        <i class="fas fa-truck"></i>
        <h3>No Goods Receipts Found</h3>
        <p>There are no goods receipts matching your criteria at the moment.</p>
      </div>

      <div *ngIf="filteredGRs.length > 0" class="gr-list">
        <div class="gr-card" *ngFor="let gr of filteredGRs">
          <div class="gr-header-info">
            <div class="gr-title">
              <h3>{{ gr.grNumber }}</h3>
              <span class="status-badge" [ngClass]="getStatusClass(gr.status)">
                {{ gr.status }}
              </span>
            </div>
            <div class="gr-meta">
              <span class="po-reference">PO: {{ gr.poNumber }}</span>
            </div>
          </div>

          <div class="gr-details">
            <div class="gr-dates">
              <div class="date-info">
                <i class="fas fa-calendar-check"></i>
                <span>Receipt Date: {{ gr.receiptDate | date:'medium' }}</span>
              </div>
            </div>
          </div>

          <div class="gr-items" *ngIf="gr.items && gr.items.length > 0">
            <h4>Items ({{ gr.items.length }})</h4>
            <div class="items-summary">
              <div class="item-preview" *ngFor="let item of gr.items.slice(0, 3)">
                <span class="item-desc">{{ item.description }}</span>
                <span class="item-status">
                  {{ item.receivedQty }}/{{ item.orderedQty }} {{ item.unit }}
                </span>
                <span class="completion-badge" 
                      [ngClass]="getCompletionClass(item.receivedQty, item.orderedQty)">
                  {{ getCompletionPercentage(item.receivedQty, item.orderedQty) }}%
                </span>
              </div>
              <div *ngIf="gr.items.length > 3" class="more-items">
                +{{ gr.items.length - 3 }} more items
              </div>
            </div>
          </div>

          <div class="gr-actions">
            <button class="btn btn-primary" (click)="viewGRDetails(gr)">
              <i class="fas fa-eye"></i>
              View Details
            </button>
            <button 
              class="btn btn-warning" 
              *ngIf="gr.status === 'Pending'"
              (click)="confirmReceipt(gr)"
            >
              <i class="fas fa-check"></i>
              Confirm Receipt
            </button>
            <button class="btn btn-secondary" (click)="printGR(gr)">
              <i class="fas fa-print"></i>
              Print
            </button>
          </div>
        </div>
      </div>

      <!-- GR Details Modal -->
      <div *ngIf="selectedGR" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedGR.grNumber }} - Details</h2>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="gr-detail-section">
              <h3>General Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>GR Number:</label>
                  <span>{{ selectedGR.grNumber }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" [ngClass]="getStatusClass(selectedGR.status)">
                    {{ selectedGR.status }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>PO Number:</label>
                  <span>{{ selectedGR.poNumber }}</span>
                </div>
                <div class="detail-item">
                  <label>Receipt Date:</label>
                  <span>{{ selectedGR.receiptDate | date:'medium' }}</span>
                </div>
              </div>
            </div>

            <div class="gr-detail-section" *ngIf="selectedGR.items">
              <h3>Items Received</h3>
              <div class="items-table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Material ID</th>
                      <th>Description</th>
                      <th>Ordered Qty</th>
                      <th>Received Qty</th>
                      <th>Unit</th>
                      <th>Storage Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedGR.items">
                      <td>{{ item.materialId }}</td>
                      <td>{{ item.description }}</td>
                      <td>{{ item.orderedQty }}</td>
                      <td>{{ item.receivedQty }}</td>
                      <td>{{ item.unit }}</td>
                      <td>{{ item.storageLocation }}</td>
                      <td>
                        <span class="completion-badge" 
                              [ngClass]="getCompletionClass(item.receivedQty, item.orderedQty)">
                          {{ getCompletionText(item.receivedQty, item.orderedQty) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Close</button>
            <button class="btn btn-primary" (click)="printGR(selectedGR)">
              <i class="fas fa-print"></i>
              Print GR
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gr-container {
      padding: 20px;
    }

    .gr-header {
      margin-bottom: 30px;
    }

    .gr-header h1 {
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

    .gr-list {
      display: grid;
      gap: 20px;
    }

    .gr-card {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .gr-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .gr-header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .gr-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .gr-title h3 {
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

    .status-badge.pending { background: #fff3e0; color: #f57c00; }
    .status-badge.partially-received { background: #f3e5f5; color: #7b1fa2; }
    .status-badge.received { background: #e8f5e8; color: #388e3c; }
    .status-badge.posted { background: #e3f2fd; color: #1976d2; }

    .gr-meta {
      text-align: right;
    }

    .po-reference {
      color: #7f8c8d;
      font-size: 14px;
    }

    .gr-dates {
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
      color: #27ae60;
    }

    .gr-items {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .gr-items h4 {
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .items-summary {
      display: grid;
      gap: 10px;
    }

    .item-preview {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 15px;
      align-items: center;
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

    .completion-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .completion-badge.complete { background: #e8f5e8; color: #388e3c; }
    .completion-badge.partial { background: #fff3e0; color: #f57c00; }
    .completion-badge.pending { background: #ffebee; color: #d32f2f; }

    .more-items {
      color: #7f8c8d;
      font-style: italic;
      text-align: center;
      padding: 5px;
    }

    .gr-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }

    .gr-actions .btn {
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

    .gr-detail-section {
      margin-bottom: 30px;
    }

    .gr-detail-section h3 {
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

      .gr-header-info {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .gr-dates {
        flex-direction: column;
        gap: 10px;
      }

      .gr-actions {
        flex-direction: column;
      }

      .item-preview {
        grid-template-columns: 1fr;
        gap: 10px;
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
export class GrComponent implements OnInit {
  grs: GoodsReceipt[] = [];
  filteredGRs: GoodsReceipt[] = [];
  selectedGR: GoodsReceipt | null = null;
  selectedStatus = '';
  isLoading = false;
  errorMessage = '';

  constructor(private grService: GrService) {}

  ngOnInit() {
    this.loadGRs();
  }

  loadGRs() {
    this.isLoading = true;
    this.errorMessage = '';

    this.grService.getGoodsReceipts().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.grs = response.data;
          this.filterGRs();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load Goods Receipts. Please try again.';
        console.error('GR load error:', error);
      }
    });
  }

  filterGRs() {
    if (this.selectedStatus) {
      this.filteredGRs = this.grs.filter(gr => 
        gr.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    } else {
      this.filteredGRs = [...this.grs];
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getCompletionPercentage(received: number, ordered: number): number {
    return Math.round((received / ordered) * 100);
  }

  getCompletionClass(received: number, ordered: number): string {
    const percentage = this.getCompletionPercentage(received, ordered);
    if (percentage === 100) return 'complete';
    if (percentage > 0) return 'partial';
    return 'pending';
  }

  getCompletionText(received: number, ordered: number): string {
    const percentage = this.getCompletionPercentage(received, ordered);
    if (percentage === 100) return 'Complete';
    if (percentage > 0) return 'Partial';
    return 'Pending';
  }

  viewGRDetails(gr: GoodsReceipt) {
    this.selectedGR = gr;
  }

  closeModal() {
    this.selectedGR = null;
  }

  confirmReceipt(gr: GoodsReceipt) {
    console.log('Confirming receipt for GR:', gr.grNumber);
    // Implement receipt confirmation logic
  }

  printGR(gr: GoodsReceipt) {
    console.log('Printing GR:', gr.grNumber);
    // Implement print logic
  }
}