import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login', standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <main class="login-page">
      <mat-card class="login-card">
        <div class="brand-mark" aria-hidden="true">✓</div>
        <p class="eyebrow">TASK MANAGEMENT</p>
        <h1>Welcome back</h1>
        <p class="subheading">Sign in to pick up where you left off.</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline"><mat-label>Email address</mat-label><input matInput type="email" formControlName="email" autocomplete="username"><mat-error>Enter a valid email address.</mat-error></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Password</mat-label><input matInput type="password" formControlName="password" autocomplete="current-password"><mat-error>Password is required.</mat-error></mat-form-field>
          @if (errorMessage) { <p class="error-message" role="alert">{{ errorMessage }}</p> }
          <button mat-flat-button color="primary" class="submit-button" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
        </form>
      </mat-card>
    </main>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(ellipse at 50% 0%, #e8eaff 0, #f7f8fc 56%); }
    .login-card { width: min(100%, 420px); box-sizing: border-box; padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px #26345d14; }
    .brand-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; background: #5148cf; color: white; font-size: 22px; font-weight: 700; }
    .eyebrow { margin: 24px 0 8px; color: #6258c9; font-size: 11px; font-weight: 700; letter-spacing: .14em; }
    h1 { margin: 0; font-size: 28px; letter-spacing: -.04em; } .subheading { margin: 8px 0 28px; color: #74798a; }
    form { display: grid; gap: 4px; } mat-form-field { width: 100%; } .submit-button { height: 48px; border-radius: 10px; margin-top: 6px; }
    .error-message { color: #b3261e; font-size: 13px; margin: 0 0 8px; }
    @media (max-width: 480px) { .login-card { padding: 28px 22px; } }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  loading = false;
  errorMessage = '';

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => { this.loading = false; void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/tasks'); },
      error: () => { this.loading = false; this.errorMessage = 'We could not sign you in. Check your details and try again.'; }
    });
  }
}
