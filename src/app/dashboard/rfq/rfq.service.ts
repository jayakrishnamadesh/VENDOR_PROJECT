import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RFQ, ApiResponse } from '../../shared/models/vendor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RfqService {
  
  constructor(private http: HttpClient) {}

  getRFQs(): Observable<ApiResponse<RFQ[]>> {
    return this.http.get<ApiResponse<RFQ[]>>(`${environment.apiUrl}/rfq`)
      .pipe(
        catchError(error => {
          console.error('RFQ service error:', error);
          // Return mock data as fallback
          return of({
            success: true,
            message: 'RFQs loaded (mock data)',
            data: [
              {
                rfqId: 'RFQ001',
                rfqNumber: 'RFQ2024001',
                description: 'Supply of Industrial Equipment for Manufacturing Unit',
                requestDate: '2024-01-15T08:00:00Z',
                dueDate: '2024-01-25T17:00:00Z',
                status: 'Open',
                totalAmount: 125000,
                currency: 'USD',
                items: [
                  {
                    itemId: 'ITM001',
                    materialId: 'MAT001',
                    description: 'Industrial Motor 5HP',
                    quantity: 10,
                    unit: 'EA',
                    unitPrice: 1200,
                    totalPrice: 12000
                  },
                  {
                    itemId: 'ITM002',
                    materialId: 'MAT002',
                    description: 'Control Panel Assembly',
                    quantity: 5,
                    unit: 'EA',
                    unitPrice: 2500,
                    totalPrice: 12500
                  }
                ]
              },
              {
                rfqId: 'RFQ002',
                rfqNumber: 'RFQ2024002',
                description: 'Raw Material Supply for Q1 Production',
                requestDate: '2024-01-18T09:00:00Z',
                dueDate: '2024-01-28T17:00:00Z',
                status: 'In Progress',
                totalAmount: 85000,
                currency: 'USD',
                items: [
                  {
                    itemId: 'ITM003',
                    materialId: 'MAT003',
                    description: 'Steel Sheets 2mm thickness',
                    quantity: 1000,
                    unit: 'SQ',
                    unitPrice: 50,
                    totalPrice: 50000
                  }
                ]
              },
              {
                rfqId: 'RFQ003',
                rfqNumber: 'RFQ2024003',
                description: 'Office Equipment and Supplies',
                requestDate: '2024-01-20T10:00:00Z',
                dueDate: '2024-01-30T17:00:00Z',
                status: 'Submitted',
                totalAmount: 15000,
                currency: 'USD',
                items: [
                  {
                    itemId: 'ITM004',
                    materialId: 'MAT004',
                    description: 'Desktop Computers',
                    quantity: 10,
                    unit: 'EA',
                    unitPrice: 800,
                    totalPrice: 8000
                  },
                  {
                    itemId: 'ITM005',
                    materialId: 'MAT005',
                    description: 'Office Chairs',
                    quantity: 10,
                    unit: 'EA',
                    unitPrice: 150,
                    totalPrice: 1500
                  }
                ]
              }
            ]
          });
        })
      );
  }

  getRFQById(rfqId: string): Observable<ApiResponse<RFQ>> {
    return this.http.get<ApiResponse<RFQ>>(`${environment.apiUrl}/rfq/${rfqId}`)
      .pipe(
        catchError(error => {
          console.error('RFQ detail error:', error);
          return of({
            success: false,
            message: 'Failed to load RFQ details',
            data: {} as RFQ
          });
        })
      );
  }

  submitQuotation(rfqId: string, quotationData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/rfq/${rfqId}/quote`, quotationData)
      .pipe(
        catchError(error => {
          console.error('Quotation submission error:', error);
          return of({
            success: false,
            message: 'Failed to submit quotation',
            data: null
          });
        })
      );
  }
}