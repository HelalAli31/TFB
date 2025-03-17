import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/serverServices/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  userForm: FormGroup;
  passwordForm: FormGroup;
  userData: any;
  isEditing: boolean = false;
  isChangingPassword: boolean = false;
  messageServer: string = '';
  passwordMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    // ✅ User Form
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      username: ['', Validators.required],
    });

    // ✅ Password Change Form
    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      this.userData = await this.userService.getUserProfile();
      if (this.userData) {
        this.userForm.patchValue(this.userData);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  async updateProfile() {
    if (this.userForm.invalid) {
      this.messageServer = '❌ Please fill all required fields correctly.';
      return;
    }

    try {
      await this.userService.updateUserProfile(
        this.userData._id,
        this.userForm.value
      );
      this.messageServer = '✅ Profile updated successfully!';
      localStorage.setItem('name', this.userForm.value.first_name);
      this.isEditing = false;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      this.messageServer = '❌ Failed to update profile.';
    }
  }

  // ✅ Toggle Password Change Form
  toggleChangePassword() {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordMessage = ''; // Reset message
    this.passwordForm.reset(); // Reset form
  }

  async changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordMessage = '❌ Please fill all fields correctly.';
      return;
    }

    const oldPassword = this.passwordForm.value.old_password;
    const newPassword = this.passwordForm.value.new_password;
    const confirmPassword = this.passwordForm.value.confirm_password;

    if (newPassword !== confirmPassword) {
      this.passwordMessage = '❌ New passwords do not match!';
      return;
    }

    try {
      console.log('📩 Sending password change request:', {
        userId: this.userData._id,
        oldPassword,
        newPassword,
      });

      const response: any = await this.userService.changePassword(
        this.userData._id,
        oldPassword,
        newPassword
      );

      if (response?.message) {
        this.passwordMessage = response.message;
      } else {
        alert('✅ Password changed successfully!');
        this.passwordMessage = '✅ Password changed successfully!';
      }

      this.isChangingPassword = false;
    } catch (error: any) {
      this.passwordMessage =
        error?.error?.message || '❌ Failed to change password.';
    }
  }
}
