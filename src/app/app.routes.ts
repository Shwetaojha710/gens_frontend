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
import { AttendanceUploadComponent } from './attendance/attendance-upload/attendance-upload.component';
import { SalaryComponentComponent } from './master/salary-component/salary-component.component';
import { SalarySetupComponent } from './payroll/salary-setup/salary-setup.component';
import { CurrencyComponent } from './master/currency/currency.component';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { PayslipOrderComponent } from './master/payslip-order/payslip-order.component';
import { ReimbursementComponent } from './payroll/reimbursement/reimbursement.component';
import { EmpProfileComponent } from './emp-profile/emp-profile.component';
import { RegularizeComponent } from './attendance/regularize/regularize.component';
import { BranchComponent } from './master/branch/branch.component';
import { BranchwiseComponent } from './branchwise/branchwise.component';
import { TrackingComponent } from './tracking/tracking.component';
import { LiveTrackingComponent } from './tracking/live-tracking/live-tracking.component';

// import { NewdashboardComponent } from './newdashboard/newdashboard.component';

import { CompanyRegComponent } from './company-reg/company-reg.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { WeekendEmpListComponent } from './attendance/weekend-emp-list/weekend-emp-list.component';
import { AddComoffComponent } from './attendance/add-comoff/add-comoff.component';
import { TrackingReportComponent } from './reports/tracking-report/tracking-report.component';
import { NdaComponent } from './employee/profile/nda/nda.component';
import { ServiceAgreementComponent } from './employee/profile/service-agreement/service-agreement.component';
import { AppointmentLetterComponent } from './employee/profile/appointment-letter/appointment-letter.component';
import { OfferLetterComponent } from './employee/profile/offer-letter/offer-letter.component';
import { LandingHomeComponent } from './landing-home/landing-home.component';
import { RecruitmentComponent } from './recruitment/recruitment.component';
import { JobsComponent } from './recruitment/jobs/jobs.component';
// import { CandidateComponent } from './recruitment/candidate/candidate.component';

import { PipelineBoardComponent } from './recruitment/pipeline/pipeline-board/pipeline-board.component';
import { ScheduleInterviewComponent } from './recruitment/interviews/schedule-interview/schedule-interview.component';
import { FeedbackFormComponent } from './recruitment/interviews/feedback-form/feedback-form.component';
import { BgvTrackerComponent } from './recruitment/offers/bgv-tracker/bgv-tracker.component';
import { OfferFormComponent } from './recruitment/offers/offer-form/offer-form.component';
import { RecuiterDashboardComponent } from './recruitment/recuiter-dashboard/recuiter-dashboard.component';
import { JobRequirementComponent } from './recruitment/jobs/job-requirement/job-requirement.component';
import { PostingSourcingComponent } from './recruitment/jobs/posting-sourcing/posting-sourcing.component';
import { PendingEmpListComponent } from './pending-emp-list/pending-emp-list.component';
import { InterviewRoundsComponent } from './recruitment/master/interview-rounds/interview-rounds.component';
import { RoundTypeComponent } from './recruitment/master/round-type/round-type.component';
import { CandidateComponent } from './recruitment/candidate/candidate.component';

export const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: LandingPageComponent },
  { path: 'landing-home', component: LandingHomeComponent },
  { path: 'login', component: LoginComponent },
  // { path: 'candidate-application', component: CandidateComponent },

  { path: 'privacy-policy', component: PrivacyPolicyComponent },

  { path: 'branchwise', component: BranchwiseComponent },
  { path: 'pending-emp-list', component: PendingEmpListComponent },

  { path: 'company-reg', component: CompanyRegComponent },
  { path: 'branchwise', component: BranchwiseComponent },

  { path: 'emp-profile', component: EmpProfileComponent },

  { path: 'check-out', component: CheckoutComponent },
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      // { path: 'dashboard', component: NewdashboardComponent },
      {
        path: 'employee',
        children: [
          { path: 'list', component: ListComponent },
          { path: 'joining', component: JoiningComponent },
          { path: 'apply-leave', component: ApplyLeaveComponent },
          {
            path: 'add', component: AddComponent,
            children: [
              { path: 'profile/professional-info/qualification', component: QualificationComponent },
              { path: 'profile/professional-info/personal', component: PersonalDetailsComponent },
              { path: 'profile/professional-info/experience', component: ExperienceComponent },
              { path: 'profile/professional-info/skills', component: SkillsComponent },
              { path: 'profile/professional-info/salary', component: SalaryStructureComponent },
              { path: 'profile/professional-info/documents', component: DocumentsComponent },
              { path: 'profile/professional-info/bank-details', component: BankDetailsComponent },
              { path: 'profile/professional-info/assign-leave', component: AssignLeaveComponent },
              { path: 'profile/professional-info/salary-setup', component: SalarySetupComponent },
              { path: 'profile/professional-info/nda', component: NdaComponent },
              { path: 'profile/professional-info/service-agreement', component: ServiceAgreementComponent },
              { path: 'profile/professional-info/appointment-letter', component: AppointmentLetterComponent },
              { path: 'profile/professional-info/offer-letter', component: OfferLetterComponent },
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
          { path: 'upload-attendance', component: AttendanceUploadComponent },
          { path: 'regularize', component: RegularizeComponent },
          { path: 'weekend-emp-list', component: WeekendEmpListComponent },
          { path: 'add-comp-off', component: AddComoffComponent },
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
          { path: 'total-salary', component: TotalSalaryComponentComponent },
          { path: 'reimbursement', component: ReimbursementComponent },


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
          { path: 'salary-component', component: SalaryComponentComponent },
          { path: 'currency', component: CurrencyComponent },
          { path: 'pay-slip', component: PayslipOrderComponent },
          { path: 'branch', component: BranchComponent },

        ]
      },
      {
        path: 'reports',
        children: [
          { path: 'employee', component: EmployeeComponent },
          { path: 'payroll', component: PayrollComponent },
          { path: 'attendance', component: AttendanceComponent },
          { path: 'tracking-report', component: TrackingReportComponent },
        ]
      },
      {
        path: 'tracking',
        component: TrackingComponent
      },
      {
        path: 'tracking/live',
        component: LiveTrackingComponent
      },

    ]
  },
  {
    path: 'recruitment',
    component: RecruitmentComponent,
    children: [
    { path: 'recruitment-dashboard', component: RecuiterDashboardComponent },
    {
      path: 'jobs',
      component: JobsComponent,
      children:[
        { path: 'job-requirement', component: JobRequirementComponent },
        { path: 'posting-sourcing', component: PostingSourcingComponent },
      ]
    },
    // { path: 'candidates', component: CandidateComponent },
    { path: 'pipeline', component: PipelineBoardComponent },
    { path: 'pipeline/:applicationId/interview/schedule', component: ScheduleInterviewComponent },
    { path: 'pipeline/:applicationId/interview/feedback', component: FeedbackFormComponent },
    { path: 'offers/:applicationId', component: OfferFormComponent },
    { path: 'offers/:applicationId/bgv', component: BgvTrackerComponent },
    {
        path: 'master',
        children: [
          { path: 'interview-round', component: InterviewRoundsComponent },
          { path: 'round-type', component: RoundTypeComponent },

        ]
      },
    ]
  },

  { path: ':slug', component: CandidateComponent },
  { path: '**', component: PageNotFoundComponent },
];
