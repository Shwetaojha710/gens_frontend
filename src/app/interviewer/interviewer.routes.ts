import { Routes } from '@angular/router';
import { InterviewerComponent } from './interviewer.component';

export const interviewerRoutes: Routes = [
  {
    path: '',
    component: InterviewerComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'interviewer-dashboard' },
      {
        path: 'interviewer-dashboard',
        loadComponent: () =>
          import('./interviewer-dashboard/interviewer-dashboard.component').then(
            (m) => m.InterviewerDashboardComponent,
          ),
      },
    ],
  },
];
