import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgingService } from './aging.service';
import { Aging } from '../../shared/models/vendor.model';

@Component({
  selector: 'app-aging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="aging-container">
      <div class="aging-header">
        <h1>Aging Report</h1>
        <p>Track outstanding payments and aging buckets</p>
      </div>

      <div class="aging-summary">
        <div class="summary-card">
          <div class="summary-icon current">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="summary-info">
            <h3>{{ agingSummary.current | currency }}</h3>
            <p>Current (0-30 days)</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon aged30">
            <i class="fas fa-clock"></i>
          </div>
          <div class="summary-info">
            <h3>{{ agingSummary.aged30 | currency }}</h3>
            <p>31-60 days</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon aged60">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="summary-info">
            <h3>{{ agingSummary.aged60 | currency }}</h3>
            <p>61-90 days</p>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon aged90">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="summary-info">
            <h3>{{ agingSummary.aged90 | currency }}</h3>
            <p>90+ days</p>
          </div>
        </div>
      </div>

      <div class="filters">
        <div class="filter-group">
          <select [(ngModel)]="selectedBucket" (change)="filterAging()" class="form-control">
            <option value="">All Aging Buckets</option>
            <option value="Current">Current (0-30 days)</option>
            <option value="31-60 days">31-60 days</option>
            <option value="61-90 days">61-90 days</option>
            <option value="90+ days">90+ days</option>
          </select>
        </div>
        <button class="btn btn-primary" (click)="loadAging()">
          <i class="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>Loading Aging Report...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && filteredAging.length === 0" class="empty-state">
        <i class="fas fa-chart-bar"></i>
        <h3>No Aging Data Found</h3>
        <p>There are no aging records matching your criteria at the moment.</p>
      </div>

      <div *ngIf="filteredAging.length > 0" class="aging-table-container">
        <table class="table aging-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Pending Amount</th>
              <th>Days Overdue</th>
              <th>Aging Bucket</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let aging of filteredAging" [ngClass]="getRowClass(aging)">
              <td>
                <strong>{{ aging.invoiceNumber }}</strong>
              </td>
              <td>{{ aging.invoiceDate | date:'short' }}</td>
              <td>{{ aging.dueDate | date:'short' }}</td>
              <td>{{ aging.totalAmount | currency:aging.currency }}</td>
              <td class="paid-amount">{{ aging.paidAmount | currency:aging.currency }}</td>
              <td class="pending-amount">{{ aging.pendingAmount | currency:aging.currency }}</td>
              <td>
                <span class="days-overdue" [ngClass]="getDaysOverdueClass(aging.daysOverdue)">
                  {{ aging.daysOverdue }} days
                </span>
              </td>
              <td>
                <span class="aging-badge" [ngClass]="getAgingBucketClass(aging.agingBucket)">
                  {{ aging.agingBucket }}
                </span>
              </td>
              <td>
                <span class="status-indicator" [ngClass]="getStatusClass(aging)">
                  {{ getStatusText(aging) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Aging Chart -->
      <div *ngIf="filteredAging.length > 0" class="aging-chart">
        <h3>Aging Distribution</h3>
        <div class="chart-container">
          <div class="chart-bar" *ngFor="let bucket of agingBuckets">
            <div class="bar-info">
              <span class="bucket-name">{{ bucket.name }}</span>
              <span class="bucket-amount">{{ bucket.amount | currency }}</span>
            </div>
            <div class="bar-visual">
              <div class="bar-fill" 
                   [style.width.%]="bucket.percentage" 
                   [ngClass]="bucket.class">
              </div>
            </div>
            <div class="bar-percentage">{{ bucket.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .aging-container {
      padding: 20px;
    }

    .aging-header {
      margin-bottom: 30px;
    }

    .aging-header h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
    }

    .aging-summary {
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

    .summary-icon.current { background: linear-gradient(135deg, #27ae60, #229954); }
    .summary-icon.aged30 { background: linear-gradient(135deg, #f39c12, #e67e22); }
    .summary-icon.aged60 { background: linear-gradient(135deg, #e67e22, #d35400); }
    .summary-icon.aged90 { background: linear-gradient(135deg, #e74c3c, #c0392b); }

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

    .filter-group select {
      min-width: 200px;
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

    .aging-table-container {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
      overflow-x: auto;
    }

    .aging-table {
      margin: 0;
    }

    .aging-table th {
      background-color: #2c3e50;
      color: white;
      font-weight: 600;
      padding: 15px 12px;
      text-align: left;
    }

    .aging-table td {
      padding: 15px 12px;
      vertical-align: middle;
    }

    .aging-table tr.current {
      background-color: rgba(39, 174, 96, 0.05);
    }

    .aging-table tr.aged-30 {
      background-color: rgba(243, 156, 18, 0.05);
    }

    .aging-table tr.aged-60 {
      background-color: rgba(230, 126, 34, 0.05);
    }

    .aging-table tr.aged-90 {
      background-color: rgba(231, 76, 60, 0.05);
    }

    .paid-amount {
      color: #27ae60;
      font-weight: 500;
    }

    .pending-amount {
      color: #e74c3c;
      font-weight: 500;
    }

    .days-overdue {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .days-overdue.current { background: #e8f5e8; color: #27ae60; }
    .days-overdue.warning { background: #fff3e0; color: #f57c00; }
    .days-overdue.danger { background: #ffebee; color: #d32f2f; }
    .days-overdue.critical { background: #f3e5f5; color: #7b1fa2; }

    .aging-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .aging-badge.current { background: #e8f5e8; color: #27ae60; }
    .aging-badge.aged-30 { background: #fff3e0; color: #f57c00; }
    .aging-badge.aged-60 { background: #ffeaa7; color: #d35400; }
    .aging-badge.aged-90 { background: #ffebee; color: #d32f2f; }

    .status-indicator {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-indicator.on-time { background: #e8f5e8; color: #27ae60; }
    .status-indicator.overdue { background: #ffebee; color: #d32f2f; }

    .aging-chart {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .aging-chart h3 {
      color: #2c3e50;
      margin-bottom: 25px;
      font-size: 20px;
    }

    .chart-container {
      display: grid;
      gap: 15px;
    }

    .chart-bar {
      display: grid;
      grid-template-columns: 150px 1fr 60px;
      align-items: center;
      gap: 15px;
    }

    .bar-info {
      display: flex;
      flex-direction: column;
    }

    .bucket-name {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    .bucket-amount {
      color: #7f8c8d;
      font-size: 12px;
    }

    .bar-visual {
      height: 25px;
      background: #ecf0f1;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }

    .bar-fill {
      height: 100%;
      border-radius: 12px;
      transition: width 0.8s ease;
    }

    .bar-fill.current { background: linear-gradient(90deg, #27ae60, #2ecc71); }
    .bar-fill.aged-30 { background: linear-gradient(90deg, #f39c12, #f1c40f); }
    .bar-fill.aged-60 { background: linear-gradient(90deg, #e67e22, #f39c12); }
    .bar-fill.aged-90 { background: linear-gradient(90deg, #e74c3c, #ec7063); }

    .bar-percentage {
      text-align: right;
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .aging-table-container {
        padding: 15px;
      }

      .aging-table {
        font-size: 12px;
      }

      .aging-table th,
      .aging-table td {
        padding: 10px 8px;
      }

      .chart-bar {
        grid-template-columns: 1fr;
        gap: 10px;
        text-align: center;
      }

      .bar-info {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  `]
})
export class AgingComponent implements OnInit {
  aging: Aging[] = [];
  filteredAging: Aging[] = [];
  selectedBucket = '';
  isLoading = false;
  errorMessage = '';

  agingSummary = {
    current: 0,
    aged30: 0,
    aged60: 0,
    aged90: 0
  };

  agingBuckets: any[] = [];

  constructor(private agingService: AgingService) {}

  ngOnInit() {
    this.loadAging();
  }

  loadAging() {
    this.isLoading = true;
    this.errorMessage = '';

    this.agingService.getAging().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.aging = response.data;
          this.calculateSummary();
          this.calculateBuckets();
          this.filterAging();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load Aging Report. Please try again.';
        console.error('Aging load error:', error);
      }
    });
  }

  calculateSummary() {
    this.agingSummary = {
      current: this.aging.filter(a => a.agingBucket === 'Current').reduce((sum, a) => sum + a.pendingAmount, 0),
      aged30: this.aging.filter(a => a.agingBucket === '31-60 days').reduce((sum, a) => sum + a.pendingAmount, 0),
      aged60: this.aging.filter(a => a.agingBucket === '61-90 days').reduce((sum, a) => sum + a.pendingAmount, 0),
      aged90: this.aging.filter(a => a.agingBucket === '90+ days').reduce((sum, a) => sum + a.pendingAmount, 0)
    };
  }

  calculateBuckets() {
    const total = this.agingSummary.current + this.agingSummary.aged30 + this.agingSummary.aged60 + this.agingSummary.aged90;
    
    this.agingBuckets = [
      {
        name: 'Current (0-30)',
        amount: this.agingSummary.current,
        percentage: total > 0 ? Math.round((this.agingSummary.current / total) * 100) : 0,
        class: 'current'
      },
      {
        name: '31-60 days',
        amount: this.agingSummary.aged30,
        percentage: total > 0 ? Math.round((this.agingSummary.aged30 / total) * 100) : 0,
        class: 'aged-30'
      },
      {
        name: '61-90 days',
        amount: this.agingSummary.aged60,
        percentage: total > 0 ? Math.round((this.agingSummary.aged60 / total) * 100) : 0,
        class: 'aged-60'
      },
      {
        name: '90+ days',
        amount: this.agingSummary.aged90,
        percentage: total > 0 ? Math.round((this.agingSummary.aged90 / total) * 100) : 0,
        class: 'aged-90'
      }
    ];
  }

  filterAging() {
    if (this.selectedBucket) {
      this.filteredAging = this.aging.filter(aging => 
        aging.agingBucket.toLowerCase() === this.selectedBucket.toLowerCase()
      );
    } else {
      this.filteredAging = [...this.aging];
    }
  }

  getRowClass(aging: Aging): string {
    switch (aging.agingBucket) {
      case 'Current': return 'current';
      case '31-60 days': return 'aged-30';
      case '61-90 days': return 'aged-60';
      case '90+ days': return 'aged-90';
      default: return '';
    }
  }

  getDaysOverdueClass(daysOverdue: number): string {
    if (daysOverdue <= 0) return 'current';
    if (daysOverdue <= 30) return 'warning';
    if (daysOverdue <= 90) return 'danger';
    return 'critical';
  }

  getAgingBucketClass(bucket: string): string {
    switch (bucket) {
      case 'Current': return 'current';
      case '31-60 days': return 'aged-30';
      case '61-90 days': return 'aged-60';
      case '90+ days': return 'aged-90';
      default: return '';
    }
  }

  getStatusClass(aging: Aging): string {
    return aging.daysOverdue > 0 ? 'overdue' : 'on-time';
  }

  getStatusText(aging: Aging): string {
    return aging.daysOverdue > 0 ? 'Overdue' : 'On Time';
  }
}