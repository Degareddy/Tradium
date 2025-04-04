import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './layouts/login-component/login-component.component';
import { DefaultComponent } from './layouts/default/default.component';
import { HomeComponent } from './general/home/home.component';
import { PageNotFoundComponent } from './general/page-not-found/page-not-found.component';
import { AdminGuard } from './admin/_guard/admin.guard';
import { AuthGuard } from './general/auth.guard';
import { AssetGuard } from './assets/_guard/asset.guard';
import { PayrollGuard } from './payroll/_guard/payroll.guard';
import { DocGuard } from './utilities/_guard/doc.guard';
import { GlGuard } from './gl/_guard/gl.guard';
import { SaleGuard } from './sales/_guard/sale.guard';
import { InventoryGuard } from './inventory/_guard/inventory.guard';
import { PurchaseGuard } from './purchase/_guard/purchase.guard';
import { MasterGuard } from './Masters/_guard/master.guard';
import { ProjectGuard } from './project/_guard/project.guard';
import { ReportGuard } from './reports/_guard/report.guard';
import { PropertyGuard } from './project/_guard/property.guard';
import { ForgotPasswordComponent } from './utilities/forgot-password/forgot-password.component';
import { TenantGuard } from './tenant/_guard/tenant.guard';
import { LandlordGuard } from './landlord/_guard/landlord.guard';
import { SkinsGuard } from './skins/skins.guard';

const routes: Routes = [
  {
    path: '', component: LoginComponent
  },
  { path: 'forgot', component: ForgotPasswordComponent},
  {
    path: '',
    component: DefaultComponent, canActivate: [AuthGuard],
    children: [
      {
        path: 'home', component: HomeComponent, canActivate: [AuthGuard],
      },
      {
        path: 'tenant',
        loadChildren: () => import('src/app/tenant/tenant/tenant.module').then(m => m.TenantModule), canActivate: [TenantGuard]
      },
      {
        path: 'landlord',
        loadChildren: () => import('src/app/landlord/landlord.module').then(m => m.LandlordModule), canActivate: [LandlordGuard]
      },
      {
        path: 'master',
        loadChildren: () => import('src/app/Masters/master.module').then(m => m.MasterModule), canActivate: [MasterGuard]
      },
      {
        path:'skins',
        loadChildren: () => import('src/app/skins/skins.module').then(m => m.SkinsModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('src/app/admin/admin.module').then(m => m.AdminModule), canActivate: [AdminGuard]
      },
      {
        path: 'purchase',
        loadChildren: () => import('src/app/purchase/purchase.module').then(m => m.PurchaseModule), canActivate: [PurchaseGuard]
      },
      {
        path: 'inventory',
        loadChildren: () => import('src/app/inventory/inventory.module').then(m => m.InventoryModule), canActivate: [InventoryGuard]
      },
      {
        path: 'sales',
        loadChildren: () => import('src/app/sales/sales.module').then(m => m.SalesModule), canActivate: [SaleGuard]
      },
      {
        path: 'gl',
        loadChildren: () => import('src/app/gl/gl.module').then(m => m.GlModule), canActivate: [GlGuard]
      },

      {
        path: 'utilities',
        loadChildren: () => import('src/app/utilities/utilities.module').then(m => m.UtilitiesModule), canActivate: [DocGuard]
      },
      {
        path: 'payroll',
        loadChildren: () => import('src/app/payroll/payroll/payroll.module').then(m => m.PayrollModule), canActivate: [PayrollGuard]
      },
      {
        path: 'assets',
        loadChildren: () => import('src/app/assets/assets.module').then(m => m.AssetsModule), canActivate: [AssetGuard]
      },
      {
        path: 'projects',
        loadChildren: () => import('src/app/project/project.module').then(m => m.ProjectModule), canActivate: [ProjectGuard]
      },
      {
        path: 'property',
        loadChildren: () => import('src/app/project/project.module').then(m => m.ProjectModule), canActivate: [PropertyGuard]
      },
      {
        path: 'reports',
        loadChildren: () => import('src/app/reports/reports.module').then(m => m.ReportsModule), canActivate: [ReportGuard]
      },
      {
        path: '**', component: PageNotFoundComponent, canActivate: [AuthGuard],
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule { }


