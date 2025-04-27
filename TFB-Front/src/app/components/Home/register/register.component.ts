import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/serverServices/user/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  public userForm: any;
  public result: any = null;
  public messageServer = '';
  constructor(
    public dialogRef: MatDialogRef<RegisterComponent>,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    // ✅ Form with all fields included
    this.userForm = this.formBuilder.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]], // ✅ Ensure valid email format
      phone: ['', [Validators.required, Validators.pattern(/^\d{9,15}$/)]], // ✅ Ensure valid phone number
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]], // ✅ Ensure password is at least 6 chars
    });
  }

  async signUp() {
    this.messageServer = ''; // Reset message
    if (!this.getValidationValues()) {
      this.messageServer = '❌ Please fill in all required fields correctly.';

      return;
    }

    try {
      const result = await this.userService.signUP(this.userForm.value);

      if (result?.user) {
        this.messageServer = '✅ Registration successful!';
      } else {
        this.messageServer = result.message || '❌ Signup failed. Try again.';
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      this.messageServer = '❌ An error occurred. Please try again.';
    }
  }

  getValidationValues(): boolean {
    if (this.userForm.invalid) {
      return false;
    }
    return true;
  }

  ngOnInit(): void {}
  closeDialog() {
    this.dialogRef.close();
  }
}
