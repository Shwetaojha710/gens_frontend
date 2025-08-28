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
import 'notyf/notyf.min.css';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  notyf: Notyf;

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

    this.notyf = new Notyf();
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notyf.error('Please fill in all required fields.');
      return;
    }

    this.auth.loginUser(this.form.value).subscribe({
      next: (res) => {

        const data = JSON.parse(res)
        if (data.status === true) {
          localStorage.setItem('token', data.data.token);
           localStorage.setItem("base_url", data.data.baseUrl);
           localStorage.setItem("PORT", data.data.PORT);
          this.notyf.success(data.message);
          this.router.navigate(['layout/dashboard']);
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

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.touched && control.invalid);
  }
}
