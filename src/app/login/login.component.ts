import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { VendorLogin } from '../shared/models/vendor.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <i class="fas fa-industry"></i>
          <h1>SAP Vendor Portal</h1>
          <p>Sign in to access your vendor dashboard</p>
        </div>
        
        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-user"></i>
              Username
            </label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="credentials.username"
              name="username"
              placeholder="Enter your username"
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lock"></i>
              Password
            </label>
            <input
              type="password"
              class="form-control"
              [(ngModel)]="credentials.password"
              name="password"
              placeholder="Enter your password"
              required
            >
          </div>
          
          <div *ngIf="errorMessage" class="alert alert-error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn-login" [disabled]="isLoading">
            <span *ngIf="isLoading" class="loading-spinner"></span>
            <i *ngIf="!isLoading" class="fas fa-sign-in-alt"></i>
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="login-footer">
          <p>Having trouble? Contact your system administrator</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .login-header i {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 20px;
    }
    
    .login-header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    .login-header p {
      color: #7f8c8d;
      font-size: 14px;
    }
    
    .form-group {
      margin-bottom: 25px;
    }
    
    .form-label {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 500;
    }
    
    .form-label i {
      margin-right: 8px;
      width: 16px;
    }
    
    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e8ed;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .btn-login:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .login-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }
    
    .login-footer p {
      color: #7f8c8d;
      font-size: 12px;
    }
    
    .alert {
      margin-bottom: 20px;
    }
    
    @media (max-width: 480px) {
      .login-card {
        padding: 30px 20px;
      }
      
      .login-header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class LoginComponent {
  credentials: VendorLogin = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Login error:', error);
      }
    });
  }
}