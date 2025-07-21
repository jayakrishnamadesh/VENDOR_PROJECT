import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from './profile.service';
import { VendorProfile } from '../shared/models/vendor.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>Vendor Profile</h1>
        <p>Manage your vendor information and settings</p>
      </div>

      <div *ngIf="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <div *ngIf="profile && !isLoading" class="profile-content">
        <form (ngSubmit)="onUpdateProfile()" class="profile-form">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Vendor ID</label>
              <input
                type="text"
                class="form-control"
                [value]="profile.vendorId"
                disabled
              >
            </div>

            <div class="form-group">
              <label class="form-label">Vendor Name</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="profile.vendorName"
                name="vendorName"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                [(ngModel)]="profile.email"
                name="email"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Phone</label>
              <input
                type="tel"
                class="form-control"
                [(ngModel)]="profile.phone"
                name="phone"
                required
              >
            </div>

            <div class="form-group full-width">
              <label class="form-label">Address</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="profile.address"
                name="address"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">City</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="profile.city"
                name="city"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Country</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="profile.country"
                name="country"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Tax ID</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="profile.taxId"
                name="taxId"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Bank Account</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="profile.bankAccount"
                name="bankAccount"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">Payment Terms</label>
              <select
                class="form-control"
                [(ngModel)]="profile.paymentTerms"
                name="paymentTerms"
                required
              >
                <option value="">Select Payment Terms</option>
                <option value="NET30">Net 30 Days</option>
                <option value="NET45">Net 45 Days</option>
                <option value="NET60">Net 60 Days</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Status</label>
              <input
                type="text"
                class="form-control"
                [value]="profile.status"
                disabled
              >
            </div>
          </div>

          <div *ngIf="successMessage" class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="isSaving">
              <span *ngIf="isSaving" class="loading-spinner"></span>
              <i *ngIf="!isSaving" class="fas fa-save"></i>
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="loadProfile()">
              <i class="fas fa-refresh"></i>
              Reload
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .profile-header {
      margin-bottom: 30px;
    }

    .profile-header h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
    }

    .profile-header p {
      color: #7f8c8d;
      font-size: 16px;
    }

    .loading-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #7f8c8d;
    }

    .profile-content {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e1e8ed;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: VendorProfile | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.profile = response.data;
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load profile. Please try again.';
        console.error('Profile load error:', error);
      }
    });
  }

  onUpdateProfile() {
    if (!this.profile) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.profileService.updateProfile(this.profile).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = 'Failed to update profile. Please try again.';
        console.error('Profile update error:', error);
      }
    });
  }
}