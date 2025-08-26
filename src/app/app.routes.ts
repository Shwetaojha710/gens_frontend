import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';

// Employee
import { ListComponent } from './employee/list/list.component';
import { AddComponent } from './employee/add/add.component';
import { PersonalDetailsComponent } from './employee/profile/personal-details/personal-details.component';
import { QualificationComponent } from './employee/profile/professional-info/qualification/qualification.component';
import { ExperienceComponent } from './employee/profile/professional-info/experience/experience.component';
import { SkillsComponent } from './employee/profile/professional-info/skills/skills.component';
import { SalaryStructureComponent } from './employee/profile/salary-structure/salary-structure.component';
import { DocumentsComponent } from './employee/profile/documents/documents.component';

// Attendance
import { ShiftMasterComponent } from './attendance/shift-master/shift-master.component';
import { LogsComponent } from './attendance/logs/logs.component';
import { LeavesComponent } from './attendance/leaves/leaves.component';

// Payroll
import { FullTimeSalaryComponent } from './payroll/full-time-salary/full-time-salary.component';
import { PartTimeSalaryComponent } from './payroll/part-time-salary/part-time-salary.component';
import { AllowancesComponent } from './payroll/allowances/allowances.component';
import { DeductionsComponent } from './payroll/deductions/deductions.component';

// Master
import { DepartmentComponent } from './master/department/department.component';
import { DesignationComponent } from './master/designation/designation.component';
import { EmploymentTypeComponent } from './master/employment-type/employment-type.component';

// Reports
import { EmployeeComponent } from './reports/employee/employee.component';
import { PayrollComponent } from './reports/payroll/payroll.component';
import { AttendanceComponent } from './reports/attendance/attendance.component';
import { LayoutComponent } from './layout/layout.component';
import { JoiningComponent } from './employee/joining/joining.component';
import { DocumentTypeComponent } from './master/document-type/document-type.component';
import { TotalSalaryComponentComponent } from './payroll/total-salary-component/total-salary-component.component';
import { SalaryMasterComponent } from './attendance/salary-master/salary-master.component';
import { BankDetailsComponent } from './employee/profile/professional-info/bank-details/bank-details.component';
import { AssignLeaveComponent } from './employee/profile/professional-info/assign-leave/assign-leave.component';
import { ApplyLeaveComponent } from './employee/apply-leave/apply-leave.component';
import { HolidayComponent } from './attendance/holiday/holiday.component';
import { DateWiseAttendanceComponent } from './attendance/date-wise-attendance/date-wise-attendance.component';
import { HolidayTypeComponent } from './master/holiday-type/holiday-type.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { GeneratedSalaryComponent } from './payroll/generated-salary/generated-salary.component';
import { PreffixComponent } from './master/preffix/preffix.component';
export const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '', redirectTo: '/Home', pathMatch: 'full'},
  { path: 'Home', component: LandingPageComponent},
  { path: 'login', component: LoginComponent },
 { path: 'check-out', component: CheckoutComponent},
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
       { path: 'dashboard', component: DashboardComponent },
      {
        path: 'employee',
        children: [
          { path: 'list', component: ListComponent },
          { path: 'joining', component: JoiningComponent },
             { path: 'apply-leave', component: ApplyLeaveComponent },
          { path: 'add', component: AddComponent,
             children: [
        { path: 'profile/professional-info/qualification', component: QualificationComponent },
        { path: 'profile/professional-info/personal', component: PersonalDetailsComponent },
        { path: 'profile/professional-info/experience', component: ExperienceComponent },
        { path: 'profile/professional-info/skills', component: SkillsComponent },
        { path: 'profile/professional-info/salary', component: SalaryStructureComponent },
        { path: 'profile/professional-info/documents', component: DocumentsComponent },
        { path: 'profile/professional-info/bank-details', component: BankDetailsComponent },
        { path: 'profile/professional-info/assign-leave', component: AssignLeaveComponent }
      ]

           },
          // { path: 'profile/personal', component: PersonalDetailsComponent },

          // { path: 'profile/experience', component: ExperienceComponent },
          // { path: 'profile/skills', component: SkillsComponent },
          // { path: 'profile/salary', component: SalaryStructureComponent },
          // { path: 'profile/documents', component: DocumentsComponent }
        ]
      },
      {
        path: 'attendance',
        children: [
          { path: 'shift', component: ShiftMasterComponent },
          { path: 'date-wise-attendance', component: DateWiseAttendanceComponent },
          { path: 'logs', component: LogsComponent },
          { path: 'leaves', component: LeavesComponent },
           { path: 'salary-master', component: SalaryMasterComponent },
           { path: 'holiday', component: HolidayComponent },
        ]
      },
      {
        path: 'payroll',
        children: [
          { path: 'full-time', component: FullTimeSalaryComponent },
          { path: 'generated-salary', component: GeneratedSalaryComponent },
          { path: 'part-time', component: PartTimeSalaryComponent },
          { path: 'allowances', component: AllowancesComponent },
          { path: 'deductions', component: DeductionsComponent },
          { path: 'total-salary', component: TotalSalaryComponentComponent }
        ]
      },
      {
        path: 'master',
        children: [
          { path: 'department', component: DepartmentComponent },
          { path: 'designation', component: DesignationComponent },
          { path: 'employment-type', component: EmploymentTypeComponent },
          { path: 'documents', component: DocumentTypeComponent },
          { path: 'holiday-type', component: HolidayTypeComponent },
          { path: 'prefix', component: PreffixComponent },
        ]
      },
      {
        path: 'reports',
        children: [
          { path: 'employee', component: EmployeeComponent },
          { path: 'payroll', component: PayrollComponent },
          { path: 'attendance', component: AttendanceComponent }
        ]
      }
    ]
  }
];
