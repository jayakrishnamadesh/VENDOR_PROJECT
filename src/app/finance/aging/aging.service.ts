import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Aging, ApiResponse } from '../../shared/models/vendor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgingService {
  
  constructor(private http: HttpClient) {}

  getAging(): Observable<ApiResponse<Aging[]>> {
    return this.http.get<ApiResponse<Aging[]>>(`${environment.apiUrl}/aging`)
      .pipe(
        catchError(error => {
          console.error('Aging service error:', error);
          // Return mock data as fallback
          return of({
            success: true,
            message: 'Aging data loaded (mock data)',
            data: [
              {
                vendorId: 'V001001',
                invoiceId: 'INV2024001',
                invoiceNumber: 'INV2024001',
                invoiceDate: '2024-01-15T00:00:00Z',
                dueDate: '2024-02-15T00:00:00Z',
                totalAmount: 25000,
                paidAmount: 0,
                pendingAmount: 25000,
                daysOverdue: 15,
                agingBucket: '31-60 days',
                currency: 'USD'
              },
              {
                vendorId: 'V001001',
                invoiceId: 'INV2024002',
                invoiceNumber: 'INV2024002',
                invoiceDate: '2024-02-01T00:00:00Z',
                dueDate: '2024-03-01T00:00:00Z',
                totalAmount: 50000,
                paidAmount: 30000,
                pendingAmount: 20000,
                daysOverdue: 5,
                agingBucket: 'Current',
                currency: 'USD'
              },
              {
                vendorId: 'V001001',
                invoiceId: 'INV2024003',
                invoiceNumber: 'INV2024003',
                invoiceDate: '2023-12-15T00:00:00Z',
                dueDate: '2024-01-15T00:00:00Z',
                totalAmount: 35000,
                paidAmount: 0,
                pendingAmount: 35000,
                daysOverdue: 65,
                agingBucket: '61-90 days',
                currency: 'USD'
              },
              {
                vendorId: 'V001001',
                invoiceId: 'INV2024004',
                invoiceNumber: 'INV2024004',
                invoiceDate: '2023-11-01T00:00:00Z',
                dueDate: '2023-12-01T00:00:00Z',
                totalAmount: 18000,
                paidAmount: 0,
                pendingAmount: 18000,
                daysOverdue: 95,
                agingBucket: '90+ days',
                currency: 'USD'
              },
              {
                vendorId: 'V001001',
                invoiceId: 'INV2024005',
                invoiceNumber: 'INV2024005',
                invoiceDate: '2024-02-20T00:00:00Z',
                dueDate: '2024-03-20T00:00:00Z',
                totalAmount: 12000,
                paidAmount: 5000,
                pendingAmount: 7000,
                daysOverdue: -5,
                agingBucket: 'Current',
                currency: 'USD'
              },
              {
                vendorId: 'V001001',
                invoiceId: 'INV2024006',
                invoiceNumber: 'INV2024006',
                invoiceDate: '2023-10-15T00:00:00Z',
                dueDate: '2023-11-15T00:00:00Z',
                totalAmount: 22000,
                paidAmount: 0,
                pendingAmount: 22000,
                daysOverdue: 125,
                agingBucket: '90+ days',
                currency: 'USD'
              }
            ]
          });
        })
      );
  }

  getAgingByVendor(vendorId: string): Observable<ApiResponse<Aging[]>> {
    return this.http.get<ApiResponse<Aging[]>>(`${environment.apiUrl}/aging/vendor/${vendorId}`)
      .pipe(
        catchError(error => {
          console.error('Vendor aging error:', error);
          return of({
            success: false,
            message: 'Failed to load vendor aging data',
            data: []
          });
        })
      );
  }
}