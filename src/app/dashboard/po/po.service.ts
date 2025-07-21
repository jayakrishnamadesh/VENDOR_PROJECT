import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PurchaseOrder, ApiResponse } from '../../shared/models/vendor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PoService {
  
  constructor(private http: HttpClient) {}

  getPurchaseOrders(): Observable<ApiResponse<PurchaseOrder[]>> {
    return this.http.get<ApiResponse<PurchaseOrder[]>>(`${environment.apiUrl}/po`)
      .pipe(
        catchError(error => {
          console.error('PO service error:', error);
          // Return mock data as fallback
          return of({
            success: true,
            message: 'Purchase Orders loaded (mock data)',
            data: [
              {
                poId: 'PO001',
                poNumber: 'PO2024001',
                vendorId: 'V001001',
                description: 'Supply of Industrial Equipment',
                orderDate: '2024-01-15T08:00:00Z',
                deliveryDate: '2024-02-15T17:00:00Z',
                status: 'Confirmed',
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
                    totalPrice: 12000,
                    deliveredQty: 5,
                    pendingQty: 5
                  },
                  {
                    itemId: 'ITM002',
                    materialId: 'MAT002',
                    description: 'Control Panel Assembly',
                    quantity: 5,
                    unit: 'EA',
                    unitPrice: 2500,
                    totalPrice: 12500,
                    deliveredQty: 0,
                    pendingQty: 5
                  }
                ]
              },
              {
                poId: 'PO002',
                poNumber: 'PO2024002',
                vendorId: 'V001001',
                description: 'Raw Material Supply Q1',
                orderDate: '2024-01-20T09:00:00Z',
                deliveryDate: '2024-02-20T17:00:00Z',
                status: 'Partially Delivered',
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
                    totalPrice: 50000,
                    deliveredQty: 600,
                    pendingQty: 400
                  }
                ]
              },
              {
                poId: 'PO003',
                poNumber: 'PO2024003',
                vendorId: 'V001001',
                description: 'Office Equipment Supply',
                orderDate: '2024-01-22T10:00:00Z',
                deliveryDate: '2024-02-10T17:00:00Z',
                status: 'Delivered',
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
                    totalPrice: 8000,
                    deliveredQty: 10,
                    pendingQty: 0
                  },
                  {
                    itemId: 'ITM005',
                    materialId: 'MAT005',
                    description: 'Office Chairs',
                    quantity: 10,
                    unit: 'EA',
                    unitPrice: 150,
                    totalPrice: 1500,
                    deliveredQty: 10,
                    pendingQty: 0
                  }
                ]
              }
            ]
          });
        })
      );
  }

  getPOById(poId: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.get<ApiResponse<PurchaseOrder>>(`${environment.apiUrl}/po/${poId}`)
      .pipe(
        catchError(error => {
          console.error('PO detail error:', error);
          return of({
            success: false,
            message: 'Failed to load Purchase Order details',
            data: {} as PurchaseOrder
          });
        })
      );
  }

  acknowledgePO(poId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/po/${poId}/acknowledge`, {})
      .pipe(
        catchError(error => {
          console.error('PO acknowledgment error:', error);
          return of({
            success: false,
            message: 'Failed to acknowledge Purchase Order',
            data: null
          });
        })
      );
  }
}