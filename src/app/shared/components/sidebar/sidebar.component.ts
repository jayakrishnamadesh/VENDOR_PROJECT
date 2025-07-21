import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <a routerLink="/dashboard" 
               routerLinkActive="active" 
               class="nav-link"
               [class.active]="currentRoute === '/dashboard'">
              <i class="fas fa-tachometer-alt"></i>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          
          <li class="nav-item">
            <a routerLink="/profile" 
               routerLinkActive="active" 
               class="nav-link">
              <i class="fas fa-user"></i>
              <span class="nav-text">Profile</span>
            </a>
          </li>
          
          <li class="nav-section" *ngIf="!isCollapsed">
            <span class="nav-section-title">Procurement</span>
          </li>
          
          <li class="nav-item">
            <a routerLink="/rfq" 
               routerLinkActive="active" 
               class="nav-link"
               title="RFQ / Quotations">
              <i class="fas fa-file-invoice"></i>
              <span class="nav-text">RFQ / Quotations</span>
            </a>
          </li>
          
          <li class="nav-item">
            <a routerLink="/purchase-orders" 
               routerLinkActive="active" 
               class="nav-link"
               title="Purchase Orders">
              <i class="fas fa-shopping-cart"></i>
              <span class="nav-text">Purchase Orders</span>
            </a>
          </li>
          
          <li class="nav-item">
            <a routerLink="/goods-receipt" 
               routerLinkActive="active" 
               class="nav-link"
               title="Goods Receipt">
              <i class="fas fa-truck"></i>
              <span class="nav-text">Goods Receipt</span>
            </a>
          </li>
          
          <li class="nav-section" *ngIf="!isCollapsed">
            <span class="nav-section-title">Finance</span>
          </li>
          
          <li class="nav-item">
            <a routerLink="/invoices" 
               routerLinkActive="active" 
               class="nav-link"
               title="Invoices">
              <i class="fas fa-file-invoice-dollar"></i>
              <span class="nav-text">Invoices</span>
            </a>
          </li>
          
          <li class="nav-item">
            <a routerLink="/payments" 
               routerLinkActive="active" 
               class="nav-link"
               title="Payments">
              <i class="fas fa-credit-card"></i>
              <span class="nav-text">Payments</span>
            </a>
          </li>
          
          <li class="nav-item">
            <a routerLink="/aging" 
               routerLinkActive="active" 
               class="nav-link"
               title="Aging Report">
              <i class="fas fa-chart-bar"></i>
              <span class="nav-text">Aging Report</span>
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
      transition: width 0.3s ease;
      z-index: 999;
    }
    
    .sidebar.collapsed {
      width: 60px;
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
      transition: opacity 0.3s ease;
    }
    
    .sidebar.collapsed .nav-section {
      opacity: 0;
      height: 0;
      padding: 0;
      overflow: hidden;
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
      position: relative;
    }
    
    .sidebar.collapsed .nav-link {
      padding: 12px;
      justify-content: center;
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
      font-size: 16px;
    }
    
    .sidebar.collapsed .nav-link i {
      margin-right: 0;
    }
    
    .nav-text {
      font-size: 14px;
      transition: opacity 0.3s ease;
      white-space: nowrap;
    }
    
    .sidebar.collapsed .nav-text {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
    
    /* Tooltip for collapsed sidebar */
    .sidebar.collapsed .nav-link {
      position: relative;
    }
    
    .sidebar.collapsed .nav-link:hover::after {
      content: attr(title);
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      background: #2c3e50;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
      margin-left: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .sidebar.collapsed .nav-link:hover::before {
      content: '';
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-right-color: #2c3e50;
      margin-left: 5px;
      z-index: 1000;
    }
    
    /* Custom scrollbar */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }
    
    .sidebar::-webkit-scrollbar-track {
      background: #34495e;
    }
    
    .sidebar::-webkit-scrollbar-thumb {
      background: #3498db;
      border-radius: 3px;
    }
    
    .sidebar::-webkit-scrollbar-thumb:hover {
      background: #2980b9;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  currentRoute = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Track current route for active state
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = event.url;
      });
    
    // Set initial route
    this.currentRoute = this.router.url;
  }
}