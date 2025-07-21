import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'rfq', 
    loadComponent: () => import('./dashboard/rfq/rfq.component').then(m => m.RfqComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'purchase-orders', 
    loadComponent: () => import('./dashboard/po/po.component').then(m => m.PoComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'goods-receipt', 
    loadComponent: () => import('./dashboard/gr/gr.component').then(m => m.GrComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'invoices', 
    loadComponent: () => import('./finance/invoice/invoice.component').then(m => m.InvoiceComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'payments', 
    loadComponent: () => import('./finance/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'aging', 
    loadComponent: () => import('./finance/aging/aging.component').then(m => m.AgingComponent),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];