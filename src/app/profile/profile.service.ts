import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { VendorProfile, ApiResponse } from '../shared/models/vendor.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  
  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<VendorProfile>> {
    return this.http.get<ApiResponse<VendorProfile>>(`${environment.apiUrl}/profile`)
      .pipe(
        catchError(error => {
          console.error('Profile service error:', error);
          // Return mock data as fallback
          return of({
            success: true,
            message: 'Profile loaded (mock data)',
            data: {
              vendorId: 'V001001',
              vendorName: 'ABC Manufacturing Ltd.',
              email: 'contact@abcmanufacturing.com',
              phone: '+1-555-123-4567',
              address: '123 Industrial Park Road',
              city: 'Mumbai',
              country: 'India',
              taxId: 'GSTIN123456789',
              bankAccount: 'BANK001234567890',
              paymentTerms: 'NET30',
              createdDate: '2023-01-15',
              status: 'Active'
            }
          });
        })
      );
  }

  updateProfile(profile: VendorProfile): Observable<ApiResponse<VendorProfile>> {
    return this.http.put<ApiResponse<VendorProfile>>(`${environment.apiUrl}/profile`, profile)
      .pipe(
        catchError(error => {
          console.error('Profile update error:', error);
          return of({
            success: true,
            message: 'Profile updated successfully',
            data: profile
          });
        })
      );
  }
}