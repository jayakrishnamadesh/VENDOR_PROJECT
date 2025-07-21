import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3>SAP Vendor Portal</h3>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    
    .loading-content {
      text-align: center;
      color: white;
    }
    
    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 30px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    h3 {
      font-size: 24px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    p {
      font-size: 16px;
      opacity: 0.9;
    }
  `]
})
export class LoadingComponent {}