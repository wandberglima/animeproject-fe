import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './container/home/home.component';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './container/login/login.component';

@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    LoginComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,

  ],
})
export class DashboardModule {}
