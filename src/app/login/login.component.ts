import { Component, OnInit } from '@angular/core';
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
          <div class="logo">
            <i class="fas fa-industry"></i>
          </div>
          <h1>SAP Vendor Portal</h1>
          <p>Sign in to access your vendor dashboard</p>
        </div>
        
        <form (ngSubmit)="onLogin()" class="login-form" #loginForm="ngForm">
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
              #usernameField="ngModel"
              [class.error]="usernameField.invalid && usernameField.touched"
            >
            <div class="field-error" *ngIf="usernameField.invalid && usernameField.touched">
              Username is required
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lock"></i>
              Password
            </label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                [(ngModel)]="credentials.password"
                name="password"
                placeholder="Enter your password"
                required
                #passwordField="ngModel"
                [class.error]="passwordField.invalid && passwordField.touched"
              >
              <button type="button" class="password-toggle" (click)="togglePassword()">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="field-error" *ngIf="passwordField.invalid && passwordField.touched">
              Password is required
            </div>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
              <span class="checkmark"></span>
              Remember me
            </label>
          </div>
          
          <div *ngIf="errorMessage" class="alert alert-error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
          
          <button type="submit" class="btn-login" [disabled]="isLoading || loginForm.invalid">
            <span *ngIf="isLoading" class="loading-spinner"></span>
            <i *ngIf="!isLoading" class="fas fa-sign-in-alt"></i>
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="login-footer">
          <div class="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Username:</strong> K901586</p>
            <p><strong>Password:</strong> Kaar@271103</p>
          </div>
          <div class="help-text">
            <p>Having trouble? Contact your system administrator</p>
            <p class="version">Version 1.0.0</p>
          </div>
        </div>
      </div>
      
      <div class="background-animation">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
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
      position: relative;
      overflow: hidden;
    }
    
    .background-animation {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
    
    .floating-shape {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }
    
    .shape-1 {
      width: 80px;
      height: 80px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }
    
    .shape-2 {
      width: 120px;
      height: 120px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }
    
    .shape-3 {
      width: 60px;
      height: 60px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 1;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    
    .logo i {
      font-size: 36px;
      color: white;
    }
    
    .login-header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 28px;
      font-weight: 700;
    }
    
    .login-header p {
      color: #7f8c8d;
      font-size: 16px;
      margin: 0;
    }
    
    .form-group {
      margin-bottom: 25px;
    }
    
    .form-label {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 600;
      font-size: 14px;
    }
    
    .form-label i {
      margin-right: 8px;
      width: 16px;
      color: #667eea;
    }
    
    .form-control {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .form-control.error {
      border-color: #e74c3c;
      background: #fdf2f2;
    }
    
    .password-input {
      position: relative;
    }
    
    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #7f8c8d;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.3s ease;
    }
    
    .password-toggle:hover {
      color: #667eea;
    }
    
    .field-error {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: #2c3e50;
      position: relative;
      padding-left: 30px;
    }
    
    .checkbox-label input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }
    
    .checkmark {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 20px;
      width: 20px;
      background-color: #f8f9fa;
      border: 2px solid #e1e8ed;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .checkbox-label input:checked ~ .checkmark {
      background-color: #667eea;
      border-color: #667eea;
    }
    
    .checkbox-label input:checked ~ .checkmark:after {
      content: '';
      position: absolute;
      left: 6px;
      top: 2px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .btn-login {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    .btn-login:active {
      transform: translateY(0);
    }
    
    .btn-login:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }
    
    .alert-error {
      background: #fdf2f2;
      color: #e74c3c;
      border: 1px solid #fadbd8;
    }
    
    .alert-success {
      background: #f0f9f0;
      color: #27ae60;
      border: 1px solid #d5f4d5;
    }
    
    .login-footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }
    
    .demo-credentials {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #667eea;
    }
    
    .demo-credentials h4 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 14px;
    }
    
    .demo-credentials p {
      margin: 5px 0;
      font-size: 13px;
      color: #555;
    }
    
    .help-text {
      text-align: center;
    }
    
    .help-text p {
      color: #7f8c8d;
      font-size: 12px;
      margin: 5px 0;
    }
    
    .version {
      opacity: 0.7;
    }
    
    @media (max-width: 480px) {
      .login-container {
        padding: 15px;
      }
      
      .login-card {
        padding: 30px 20px;
      }
      
      .login-header h1 {
        font-size: 24px;
      }
      
      .logo {
        width: 60px;
        height: 60px;
      }
      
      .logo i {
        font-size: 28px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  credentials: VendorLogin = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  rememberMe = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Pre-fill demo credentials
    this.credentials = {
      username: 'K901586',
      password: 'Kaar@271103'
    };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Login successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
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