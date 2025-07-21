import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
              <i class="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">
              <i class="fas fa-user"></i>
              <span>Profile</span>
            </a>
          </li>
          
          <li class="nav-section">
            <span class="nav-section-title">Procurement</span>
          </li>
          <li class="nav-item">
            <a routerLink="/rfq" routerLinkActive="active" class="nav-link">
              <i class="fas fa-file-invoice"></i>
              <span>RFQ / Quotations</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/purchase-orders" routerLinkActive="active" class="nav-link">
              <i class="fas fa-shopping-cart"></i>
              <span>Purchase Orders</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/goods-receipt" routerLinkActive="active" class="nav-link">
              <i class="fas fa-truck"></i>
              <span>Goods Receipt</span>
            </a>
          </li>
          
          <li class="nav-section">
            <span class="nav-section-title">Finance</span>
          </li>
          <li class="nav-item">
            <a routerLink="/invoices" routerLinkActive="active" class="nav-link">
              <i class="fas fa-file-invoice-dollar"></i>
              <span>Invoices</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/payments" routerLinkActive="active" class="nav-link">
              <i class="fas fa-credit-card"></i>
              <span>Payments</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/aging" routerLinkActive="active" class="nav-link">
              <i class="fas fa-chart-bar"></i>
              <span>Aging Report</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 60px;
      left: 0;
      width: 250px;
      height: calc(100vh - 60px);
      background-color: #2c3e50;
      overflow-y: auto;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }
    
    .sidebar-nav {
      padding: 20px 0;
    }
    
    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-section {
      padding: 15px 20px 5px;
    }
    
    .nav-section-title {
      color: #bdc3c7;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 1px;
    }
    
    .nav-item {
      margin-bottom: 2px;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: #ecf0f1;
      text-decoration: none;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
    }
    
    .nav-link:hover {
      background-color: #34495e;
      border-left-color: #3498db;
    }
    
    .nav-link.active {
      background-color: #3498db;
      border-left-color: #2980b9;
    }
    
    .nav-link i {
      width: 20px;
      margin-right: 12px;
      text-align: center;
    }
    
    .nav-link span {
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  constructor(private router: Router) {}
}