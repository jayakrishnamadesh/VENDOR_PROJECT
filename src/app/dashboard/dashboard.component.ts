import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <p>Overview of your vendor activities</p>
      </div>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-file-invoice"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.pendingRFQs }}</h3>
            <p>Pending RFQs</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon active">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.activePOs }}</h3>
            <p>Active Purchase Orders</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon warning">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.pendingInvoices }}</h3>
            <p>Pending Invoices</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon success">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.paidAmount | currency }}</h3>
            <p>Total Paid</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-section">
          <div class="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div class="quick-actions">
            <a routerLink="/rfq" class="action-card">
              <i class="fas fa-file-invoice"></i>
              <h3>View RFQs</h3>
              <p>Check and respond to requests for quotations</p>
            </a>
            
            <a routerLink="/purchase-orders" class="action-card">
              <i class="fas fa-shopping-cart"></i>
              <h3>Purchase Orders</h3>
              <p>View and manage your purchase orders</p>
            </a>
            
            <a routerLink="/invoices" class="action-card">
              <i class="fas fa-file-invoice-dollar"></i>
              <h3>Submit Invoice</h3>
              <p>Create and submit invoices for payment</p>
            </a>
            
            <a routerLink="/payments" class="action-card">
              <i class="fas fa-credit-card"></i>
              <h3>Track Payments</h3>
              <p>Monitor payment status and history</p>
            </a>
          </div>
        </div>
        
        <div class="dashboard-section">
          <div class="section-header">
            <h2>Recent Activities</h2>
          </div>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let activity of recentActivities">
              <div class="activity-icon" [ngClass]="activity.type">
                <i [class]="activity.icon"></i>
              </div>
              <div class="activity-content">
                <p class="activity-title">{{ activity.title }}</p>
                <p class="activity-date">{{ activity.date | date:'short' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    
    .dashboard-header {
      margin-bottom: 30px;
    }
    
    .dashboard-header h1 {
      color: #2c3e50;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .dashboard-header p {
      color: #7f8c8d;
      font-size: 16px;
    }
    
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
    }
    
    .stat-icon.pending { background: linear-gradient(135deg, #f39c12, #e67e22); }
    .stat-icon.active { background: linear-gradient(135deg, #3498db, #2980b9); }
    .stat-icon.warning { background: linear-gradient(135deg, #e74c3c, #c0392b); }
    .stat-icon.success { background: linear-gradient(135deg, #27ae60, #229954); }
    
    .stat-info h3 {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin: 0;
    }
    
    .stat-info p {
      color: #7f8c8d;
      margin: 5px 0 0;
      font-size: 14px;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }
    
    .dashboard-section {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .section-header {
      margin-bottom: 20px;
    }
    
    .section-header h2 {
      color: #2c3e50;
      font-size: 20px;
      margin: 0;
    }
    
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .action-card {
      background: #f8f9fa;
      border: 2px solid transparent;
      border-radius: 8px;
      padding: 20px;
      text-decoration: none;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .action-card:hover {
      border-color: #3498db;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .action-card i {
      font-size: 32px;
      color: #3498db;
      margin-bottom: 15px;
    }
    
    .action-card h3 {
      color: #2c3e50;
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .action-card p {
      color: #7f8c8d;
      font-size: 12px;
      margin: 0;
    }
    
    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #ecf0f1;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
    }
    
    .activity-icon.rfq { background-color: #f39c12; }
    .activity-icon.po { background-color: #3498db; }
    .activity-icon.invoice { background-color: #e74c3c; }
    .activity-icon.payment { background-color: #27ae60; }
    
    .activity-content {
      flex: 1;
    }
    
    .activity-title {
      color: #2c3e50;
      font-weight: 500;
      margin: 0 0 5px 0;
      font-size: 14px;
    }
    
    .activity-date {
      color: #7f8c8d;
      font-size: 12px;
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
      
      .quick-actions {
        grid-template-columns: 1fr;
      }
      
      .dashboard-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = {
    pendingRFQs: 5,
    activePOs: 12,
    pendingInvoices: 3,
    paidAmount: 45000
  };

  recentActivities = [
    {
      title: 'New RFQ received - RFQ2024001',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'rfq',
      icon: 'fas fa-file-invoice'
    },
    {
      title: 'Purchase Order PO2024001 approved',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: 'po',
      icon: 'fas fa-shopping-cart'
    },
    {
      title: 'Invoice INV2024001 submitted',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'invoice',
      icon: 'fas fa-file-invoice-dollar'
    },
    {
      title: 'Payment received - $12,500',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'payment',
      icon: 'fas fa-credit-card'
    }
  ];

  ngOnInit() {
    // Load dashboard data
    console.log('Dashboard loaded');
  }
}