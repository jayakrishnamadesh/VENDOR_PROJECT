import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { VendorLogin, VendorLoginResponse, ApiResponse } from '../../shared/models/vendor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentVendorSubject = new BehaviorSubject<any>(null);
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentVendor$ = this.currentVendorSubject.asObservable();
  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    this.initializeAuth();
  }

  private initializeAuth() {
    const token = localStorage.getItem('vendorToken');
    const vendor = localStorage.getItem('currentVendor');
    
    if (token && vendor) {
      try {
        const vendorData = JSON.parse(vendor);
        this.isAuthenticatedSubject.next(true);
        this.currentVendorSubject.next(vendorData);
      } catch (error) {
        console.error('Error parsing stored vendor data:', error);
        this.logout();
      }
    }
  }

  login(credentials: VendorLogin): Observable<VendorLoginResponse> {
    return this.http.post<VendorLoginResponse>(`${environment.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (response.success) {
            // Store authentication data
            localStorage.setItem('vendorToken', response.token || 'demo-token');
            localStorage.setItem('currentVendor', JSON.stringify({
              vendorId: response.vendorId,
              username: credentials.username,
              loginTime: new Date().toISOString()
            }));
            
            this.isAuthenticatedSubject.next(true);
            this.currentVendorSubject.next({
              vendorId: response.vendorId,
              username: credentials.username,
              loginTime: new Date().toISOString()
            });
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Login failed. Please check your credentials and try again.'
          });
        })
      );
  }

  verifyToken(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/login/verify`)
      .pipe(
        catchError(error => {
          console.error('Token verification error:', error);
          return of({
            success: false,
            message: 'Token verification failed',
            data: null
          });
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/login/logout`, {})
      .pipe(
        map(() => {
          this.clearAuthData();
          return { success: true };
        }),
        catchError(() => {
          this.clearAuthData();
          return of({ success: true });
        })
      );
  }

  private clearAuthData(): void {
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
    try {
      return vendor ? JSON.parse(vendor) : null;
    } catch (error) {
      console.error('Error parsing current vendor:', error);
      return null;
    }
  }

  toggleSidebar(): void {
    const currentState = this.sidebarCollapsedSubject.value;
    this.sidebarCollapsedSubject.next(!currentState);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
  }
}