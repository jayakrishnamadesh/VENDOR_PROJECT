import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Invoice, ApiResponse } from '../../shared/models/vendor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  
  constructor(private http: HttpClient) {}

  getInvoices(): Observable<ApiResponse<Invoice[]>> {
    return this.http.get<ApiResponse<Invoice[]>>(`${environment.apiUrl}/invoice`)
      .pipe(
        catchError(error => {
          console.error('Invoice service error:', error);
          // Return mock data as fallback
          return of({
            success: true,
            message: 'Invoices loaded (mock data)',
            data: [
              {
                invoiceId: 'INV001',
                invoiceNumber: 'INV2024001',
                vendorId: 'V001001',
                poId: 'PO2024001',
                invoiceDate: '2024-02-01T08:00:00Z',
                dueDate: '2024-03-01T17:00:00Z',
                status: 'Submitted',
                totalAmount: 25000,
                paidAmount: 0,
                pendingAmount: 25000,
                currency: 'USD',
                items: [
                  {
                    itemId: 'INV-ITM001',
                    description: 'Industrial Motor 5HP',
                    quantity: 5,
                    unitPrice: 1200,
                    totalPrice: 6000,
                    taxAmount: 600
                  },
                  {
                    itemId: 'INV-ITM002',
                    description: 'Installation Service',
                    quantity: 1,
                    unitPrice: 2000,
                    totalPrice: 2000,
                    taxAmount: 200
                  }
                ]
              },
              {
                invoiceId: 'INV002',
                invoiceNumber: 'INV2024002',
                vendorId: 'V001001',
                poId: 'PO2024002',
                invoiceDate: '2024-02-05T09:00:00Z',
                dueDate: '2024-03-05T17:00:00Z',
                status: 'Approved',
                totalAmount: 50000,
                paidAmount: 30000,
                pendingAmount: 20000,
                currency: 'USD',
                items: [
                  {
                    itemId: 'INV-ITM003',
                    description: 'Steel Sheets 2mm thickness',
                    quantity: 600,
                    unitPrice: 50,
                    totalPrice: 30000,
                    taxAmount: 3000
                  }
                ]
              },
              {
                invoiceId: 'INV003',
                invoiceNumber: 'INV2024003',
                vendorId: 'V001001',
                poId: 'PO2024003',
                invoiceDate: '2024-02-10T10:00:00Z',
                dueDate: '2024-03-10T17:00:00Z',
                status: 'Paid',
                totalAmount: 15000,
                paidAmount: 15000,
                pendingAmount: 0,
                currency: 'USD',
                items: [
                  {
                    itemId: 'INV-ITM004',
                    description: 'Desktop Computers',
                    quantity: 10,
                    unitPrice: 800,
                    totalPrice: 8000,
                    taxAmount: 800
                  },
                  {
                    itemId: 'INV-ITM005',
                    description: 'Office Chairs',
                    quantity: 10,
                    unitPrice: 150,
                    totalPrice: 1500,
                    taxAmount: 150
                  }
                ]
              },
              {
                invoiceId: 'INV004',
                invoiceNumber: 'INV2024004',
                vendorId: 'V001001',
                poId: 'PO2024001',
                invoiceDate: '2024-02-15T11:00:00Z',
                dueDate: '2024-03-15T17:00:00Z',
                status: 'Draft',
                totalAmount: 12000,
                paidAmount: 0,
                pendingAmount: 12000,
                currency: 'USD',
                items: [
                  {
                    itemId: 'INV-ITM006',
                    description: 'Control Panel Assembly',
                    quantity: 5,
                    unitPrice: 2500,
                    totalPrice: 12500,
                    taxAmount: 1250
                  }
                ]
              }
            ]
          });
        })
      );
  }

  getInvoiceById(invoiceId: string): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${environment.apiUrl}/invoice/${invoiceId}`)
      .pipe(
        catchError(error => {
          console.error('Invoice detail error:', error);
          return of({
            success: false,
            message: 'Failed to load Invoice details',
            data: {} as Invoice
          });
        })
      );
  }

  createInvoice(invoiceData: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${environment.apiUrl}/invoice`, invoiceData)
      .pipe(
        catchError(error => {
          console.error('Invoice creation error:', error);
          return of({
            success: false,
            message: 'Failed to create invoice',
            data: {} as Invoice
          });
        })
      );
  }

  updateInvoice(invoiceId: string, invoiceData: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${environment.apiUrl}/invoice/${invoiceId}`, invoiceData)
      .pipe(
        catchError(error => {
          console.error('Invoice update error:', error);
          return of({
            success: false,
            message: 'Failed to update invoice',
            data: {} as Invoice
          });
        })
      );
  }

  submitInvoice(invoiceId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/invoice/${invoiceId}/submit`, {})
      .pipe(
        catchError(error => {
          console.error('Invoice submission error:', error);
          return of({
            success: false,
            message: 'Failed to submit invoice',
            data: null
          });
        })
      );
  }
}