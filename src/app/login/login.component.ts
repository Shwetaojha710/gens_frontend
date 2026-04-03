import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Notyf } from 'notyf';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  phoneForm: FormGroup;
  otpForm: FormGroup;
  notyf: Notyf;
  isMobile = false;
  otpStep = false;
  tenantId = '';
  resendTimer = 0;

otpControl:any
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.isMobile = window.matchMedia('(max-width: 768px)').matches;

    this.form = this.fb.group({
      tenantId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.phoneForm = this.fb.group({
      tenantId: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\\d{9}$/)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', Validators.required]
    });

    this.notyf = new Notyf();
  }

  passwordVisible: boolean = false;

  sendOtp() {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      this.notyf.error('Please enter valid company code and phone.');
      return;
    }

    const payload = this.phoneForm.value;
    this.tenantId = payload.tenantId;
    this.auth.sendOtp(payload).subscribe({
      next: (res) => {
        const data = JSON.parse(res);
        if (data.status) {
          this.otpStep = true;
          this.notyf.success('OTP sent! Check your phone.');
          this.startResendTimer();
        } else {
          this.notyf.error(data.message || 'OTP send failed.');
        }
      },
      error: (err) => this.notyf.error(err.error?.message || 'Error sending OTP')
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    const payload = {
      tenantId: this.tenantId,
      phone: this.phoneForm.value.phone,
      otp: this.otpForm.value.otp
    };

    this.auth.verifyOtp(payload).subscribe({
      next: (res) => {
        const data = JSON.parse(res);
        if (data.status) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem("base_url", data.data.baseUrl);
          localStorage.setItem("PORT", data.data.PORT);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('tenant', JSON.stringify(data.data.tenant));
          localStorage.setItem('branch', JSON.stringify(data.data.branch));
          localStorage.setItem('currency', JSON.stringify(data.data.currencyList));

          const user = data.data.user;
          if (user.role === 'panel_user' || user.designation?.toLowerCase().includes('interviewer')) {
            this.router.navigate(['interviewer-dashboard']);
          } else {
            this.router.navigate(['branchwise']);
          }

          this.notyf.success('Login successful!');
        } else {
          this.notyf.error(data.message || 'Invalid OTP');
        }
      },
      error: (err) => this.notyf.error(err.error?.message || 'OTP verification failed')
    });
  }

  private startResendTimer() {
    this.resendTimer = 60;
    const interval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  loginWithMobile() {
    // Toggle to mobile form
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notyf.error('Please fill in all required fields.');
      return;
    }

    this.auth.loginUser(this.form.value).subscribe({
      next: (res) => {
        const data = JSON.parse(res);
        if (data.status) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem("base_url", data.data.baseUrl);
          localStorage.setItem("PORT", data.data.PORT);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('tenant', JSON.stringify(data.data.tenant));
          localStorage.setItem('branch', JSON.stringify(data.data.branch));
          localStorage.setItem('currency', JSON.stringify(data.data.currencyList));

          const user = data.data.user;
          if (user.role === 'panel_user' || user.designation?.toLowerCase().includes('interviewer')) {
            this.router.navigate(['interviewer-dashboard']);
          } else {
            this.router.navigate(['branchwise']);
          }

          this.notyf.success(data.message);
        } else {
          this.notyf.error(data.message);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.notyf.error(err.error?.message || 'Server error. Please try again.');
      }
    });
  }


  // isInvalid(field: string): boolean {
  //   const control = this.form.get(field);
  //   return !!(control && control.touched && control.invalid);
  // }
  goToEmpProfile() {
    this.router.navigate(['emp-profile']);
  }
  gotoRegister() {
    this.router.navigate(['company-reg']);
  }
  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}

