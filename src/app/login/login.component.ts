import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Notyf } from 'notyf';
import { RouterModule } from '@angular/router';
import { NgItemLabelDirective } from "@ng-select/ng-select";
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgItemLabelDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showMobileLogin = false;
  form: FormGroup;
  phoneForm: FormGroup;
  otpForm: FormGroup;
  notyf: Notyf;
  // showMobileLogin = false;
  otpStep = false;
  tenantId = '';
  resendTimer = 0;
  // otpControl: any;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      tenantId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.phoneForm = this.fb.group({
      tenantId: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]]
    });

    this.otpForm = this.fb.group({
      digit1: ['', Validators.required],
      digit2: ['', Validators.required],
      digit3: ['', Validators.required],
      digit4: ['', Validators.required]
    });

    this.notyf = new Notyf();
  }

  passwordVisible: boolean = false;

  sendOtp() {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
    this.notyf.error('Please enter valid phone number.');
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
    // if (this.otpForm.invalid) {
    //   this.otpForm.markAllAsTouched();
    //   return;
    // }

    const { digit1, digit2, digit3, digit4 } = this.otpForm.value;
    const payload = {
      tenantId: this.tenantId,
      phone: this.phoneForm.value.phone,
      otp: `${digit1}${digit2}${digit3}${digit4}`
    };

    this.auth.verifyOtp(payload).subscribe({
      next: (res) => {
        const data = JSON.parse(res);
        console.log('verifyOtp response:', data);
        if (data.status) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem("base_url", data.data.baseUrl);
          localStorage.setItem("PORT", data.data.PORT);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('tenant', JSON.stringify(data.data.tenant));
          localStorage.setItem('branch', JSON.stringify(data.data.branch));
          localStorage.setItem('currency', JSON.stringify(data.data.currencyList));

          const user = data.data.user;
          // if (user.role === 'panel_user' || user.designation?.toLowerCase().includes('interviewer')) {
            this.router.navigate(['interviewer-dashboard']);
          // }
          // else {
            // this.router.navigate(['branchwise']);
          // }

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
    this.showMobileLogin = !this.showMobileLogin;
    this.otpStep = false;
    this.phoneForm.reset();
    // Sync tenantId from email form if available
    const tenantIdValue = this.form.get('tenantId')?.value;
    if (tenantIdValue) {
      this.phoneForm.patchValue({ tenantId: tenantIdValue });
    }
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
  onPhoneInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (value.length === 10 && this.phoneForm.valid) {
      this.sendOtp();
    }
  }

  onOtpInput(event: Event, next: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && next) next.focus();
  }

  onOtpKeydown(event: KeyboardEvent, prev: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && input.value === '' && prev) prev.focus();
  }

  get phoneControl(): FormControl {
    return this.phoneForm.get('phone') as FormControl;
  }

  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}

