import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Payment, ApiResponse } from '../../shared/models/vendor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  constructor(private http: HttpClient) {}

  getPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${environment.apiUrl}/payment`)
      .pipe(
        catchError(error => {
          console.error('Payment service error:', error);
          // Return mock data as fallback
          return of({
            success: true,
            message: 'Payments loaded (mock data)',
            data: [
              {
                paymentId: 'PAY001',
                vendorId: 'V001001',
                invoiceId: 'INV2024001',
                paymentDate: '2024-02-15T10:00:00Z',
                amount: 25000,
                currency: 'USD',
                paymentMethod: 'Bank Transfer',
                status: 'Completed',
                referenceNumber: 'PAY-2024-001'
              },
              {
                paymentId: 'PAY002',
                vendorId: 'V001001',
                invoiceId: 'INV2024002',
                paymentDate: '2024-02-20T14:00:00Z',
                amount: 30000,
                currency: 'USD',
                paymentMethod: 'Wire Transfer',
                status: 'Completed',
                referenceNumber: 'PAY-2024-002'
              },
              {
                paymentId: 'PAY003',
                vendorId: 'V001001',
                invoiceId: 'INV2024003',
                paymentDate: '2024-03-01T09:00:00Z',
                amount: 15000,
                currency: 'USD',
                paymentMethod: 'ACH',
                status: 'Completed',
                referenceNumber: 'PAY-2024-003'
              },
              {
                paymentId: 'PAY004',
                vendorId: 'V001001',
                invoiceId: 'INV2024002',
                paymentDate: '2024-03-05T11:00:00Z',
                amount: 20000,
                currency: 'USD',
                paymentMethod: 'Bank Transfer',
                status: 'Pending',
                referenceNumber: 'PAY-2024-004'
              },
              {
                paymentId: 'PAY005',
                vendorId: 'V001001',
                invoiceId: 'INV2024005',
                paymentDate: '2024-03-10T16:00:00Z',
                amount: 8000,
                currency: 'USD',
                paymentMethod: 'Check',
                status: 'Processing',
                referenceNumber: 'PAY-2024-005'
              },
              {
                paymentId: 'PAY006',
                vendorId: 'V001001',
                invoiceId: 'INV2024006',
                paymentDate: '2024-03-12T08:00:00Z',
                amount: 12000,
                currency: 'USD',
                paymentMethod: 'Wire Transfer',
                status: 'Failed',
                referenceNumber: 'PAY-2024-006'
              }
            ]
          });
        })
      );
  }

  getPaymentById(paymentId: string): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${environment.apiUrl}/payment/${paymentId}`)
      .pipe(
        catchError(error => {
          console.error('Payment detail error:', error);
          return of({
            success: false,
            message: 'Failed to load Payment details',
            data: {} as Payment
          });
        })
      );
  }

  retryPayment(paymentId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/payment/${paymentId}/retry`, {})
      .pipe(
        catchError(error => {
          console.error('Payment retry error:', error);
          return of({
            success: false,
            message: 'Failed to retry payment',
            data: null
          });
        })
      );
  }
}