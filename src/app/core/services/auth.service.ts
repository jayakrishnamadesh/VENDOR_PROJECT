import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { VendorLogin, VendorLoginResponse } from '../../shared/models/vendor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentVendorSubject = new BehaviorSubject<any>(null);
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentVendor$ = this.currentVendorSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = localStorage.getItem('vendorToken');
    const vendor = localStorage.getItem('currentVendor');
    
    if (token && vendor) {
      this.isAuthenticatedSubject.next(true);
      this.currentVendorSubject.next(JSON.parse(vendor));
    }
  }

  login(credentials: VendorLogin): Observable<VendorLoginResponse> {
    return this.http.post<VendorLoginResponse>(`${environment.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (response.success) {
            // Store authentication data
            localStorage.setItem('vendorToken', response.token || 'dummy-token');
            localStorage.setItem('currentVendor', JSON.stringify({
              vendorId: response.vendorId,
              username: credentials.username
            }));
            
            this.isAuthenticatedSubject.next(true);
            this.currentVendorSubject.next({
              vendorId: response.vendorId,
              username: credentials.username
            });
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return of({
            success: false,
            message: 'Login failed. Please check your credentials and try again.'
          });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('currentVendor');
    this.isAuthenticatedSubject.next(false);
    this.currentVendorSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('vendorToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentVendor(): any {
    const vendor = localStorage.getItem('currentVendor');
    return vendor ? JSON.parse(vendor) : null;
  }
}