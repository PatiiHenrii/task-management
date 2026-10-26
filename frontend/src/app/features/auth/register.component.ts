import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <main class="register-page">
      <mat-card class="register-card">
        <div class="brand-mark" aria-hidden="true">✓</div>
        <p class="eyebrow">TASK MANAGEMENT</p>
        <h1>Create your account</h1>
        <p class="subheading">Get organized and make room for what matters.</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Full name</mat-label>
            <input matInput type="text" formControlName="name" autocomplete="name" maxlength="255">
            @if (form.controls.name.hasError('required')) { <mat-error>Name is required.</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email address</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" maxlength="320">
            @if (form.controls.email.hasError('required')) { <mat-error>Email is required.</mat-error> }
            @if (form.controls.email.hasError('email')) { <mat-error>Enter a valid email address.</mat-error> }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password">
            @if (form.controls.password.hasError('required')) { <mat-error>Password is required.</mat-error> }
            @if (form.controls.password.hasError('minlength')) { <mat-error>Use at least 8 characters.</mat-error> }
            @if (form.controls.password.hasError('maxlength')) { <mat-error>Password must be 72 characters or fewer.</mat-error> }
          </mat-form-field>
          @if (errorMessage) { <p class="error-message" role="alert">{{ errorMessage }}</p> }
          <button mat-flat-button color="primary" class="submit-button" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Creating account…' : 'Create account' }}
          </button>
        </form>
        <p class="footer-link">Already have an account? <a routerLink="/login">Sign in</a></p>
      </mat-card>
    </main>
  `,
  styles: [`
    .register-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(ellipse at 50% 0%, #e8eaff 0, #f7f8fc 56%); }
    .register-card { width: min(100%, 440px); box-sizing: border-box; padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px #26345d14; }
    .brand-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; background: #5148cf; color: white; font-size: 22px; font-weight: 700; }
    .eyebrow { margin: 24px 0 8px; color: #6258c9; font-size: 11px; font-weight: 700; letter-spacing: .14em; }
    h1 { margin: 0; font-size: 28px; letter-spacing: -.04em; } .subheading { margin: 8px 0 28px; color: #74798a; }
    form { display: grid; gap: 4px; } mat-form-field { width: 100%; } .submit-button { height: 48px; border-radius: 10px; margin-top: 6px; }
    .error-message { color: #b3261e; font-size: 13px; margin: 0 0 8px; }
    .footer-link { margin: 22px 0 0; text-align: center; color: #74798a; font-size: 13px; } .footer-link a { color: #5148cf; font-weight: 600; text-decoration: none; }
    @media (max-width: 480px) { .register-card { padding: 28px 22px; } }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]]
  });
  loading = false;
  errorMessage = '';

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    const request = this.form.getRawValue();
    request.name = request.name.trim();
    request.email = request.email.trim();
    this.auth.register(request).subscribe({
      next: () => { this.loading = false; void this.router.navigate(['/login']); },
      error: () => {
        this.loading = false;
        this.errorMessage = 'We could not create your account. Check your details or try another email.';
      }
    });
  }
}
