import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { GoodsReceipt, ApiResponse } from '../../shared/models/vendor.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GrService {
  
  constructor(private http: HttpClient) {}

  getGoodsReceipts(): Observable<ApiResponse<GoodsReceipt[]>> {
    return this.http.get<ApiResponse<GoodsReceipt[]>>(`${environment.apiUrl}/gr`)
      .pipe(
        catchError(error => {
          console.error('GR service error:', error);
          // Return mock data as fallback
          return of({
            success: true,
            message: 'Goods Receipts loaded (mock data)',
            data: [
              {
                grId: 'GR001',
                grNumber: 'GR2024001',
                poId: 'PO001',
                poNumber: 'PO2024001',
                receiptDate: '2024-01-25T10:00:00Z',
                status: 'Partially Received',
                items: [
                  {
                    itemId: 'ITM001',
                    materialId: 'MAT001',
                    description: 'Industrial Motor 5HP',
                    orderedQty: 10,
                    receivedQty: 5,
                    unit: 'EA',
                    storageLocation: 'WH001-A01'
                  },
                  {
                    itemId: 'ITM002',
                    materialId: 'MAT002',
                    description: 'Control Panel Assembly',
                    orderedQty: 5,
                    receivedQty: 0,
                    unit: 'EA',
                    storageLocation: 'WH001-A02'
                  }
                ]
              },
              {
                grId: 'GR002',
                grNumber: 'GR2024002',
                poId: 'PO002',
                poNumber: 'PO2024002',
                receiptDate: '2024-01-28T14:00:00Z',
                status: 'Received',
                items: [
                  {
                    itemId: 'ITM003',
                    materialId: 'MAT003',
                    description: 'Steel Sheets 2mm thickness',
                    orderedQty: 600,
                    receivedQty: 600,
                    unit: 'SQ',
                    storageLocation: 'WH001-B01'
                  }
                ]
              },
              {
                grId: 'GR003',
                grNumber: 'GR2024003',
                poId: 'PO003',
                poNumber: 'PO2024003',
                receiptDate: '2024-02-02T11:00:00Z',
                status: 'Posted',
                items: [
                  {
                    itemId: 'ITM004',
                    materialId: 'MAT004',
                    description: 'Desktop Computers',
                    orderedQty: 10,
                    receivedQty: 10,
                    unit: 'EA',
                    storageLocation: 'WH002-A01'
                  },
                  {
                    itemId: 'ITM005',
                    materialId: 'MAT005',
                    description: 'Office Chairs',
                    orderedQty: 10,
                    receivedQty: 10,
                    unit: 'EA',
                    storageLocation: 'WH002-A02'
                  }
                ]
              }
            ]
          });
        })
      );
  }

  getGRById(grId: string): Observable<ApiResponse<GoodsReceipt>> {
    return this.http.get<ApiResponse<GoodsReceipt>>(`${environment.apiUrl}/gr/${grId}`)
      .pipe(
        catchError(error => {
          console.error('GR detail error:', error);
          return of({
            success: false,
            message: 'Failed to load Goods Receipt details',
            data: {} as GoodsReceipt
          });
        })
      );
  }

  confirmReceipt(grId: string, confirmationData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/gr/${grId}/confirm`, confirmationData)
      .pipe(
        catchError(error => {
          console.error('GR confirmation error:', error);
          return of({
            success: false,
            message: 'Failed to confirm receipt',
            data: null
          });
        })
      );
  }
}