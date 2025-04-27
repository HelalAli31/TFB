import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { RegisterComponent } from '../register/register.component';
import { Router } from '@angular/router';
import getIsAdmin from '../../../serverServices/Payload/isAdmin';
import getPayload from '../../../serverServices/Payload/getPayload';
import { UserService } from 'src/app/serverServices/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public username: string;
  public password: string = '';
  public token: any;
  public loginFailed: string = '';
  public LoggedIn: boolean = false;
  public user: any;
  public serverMsg: string = '';

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LoginComponent>,
    private router: Router,
    private userService: UserService
  ) {
    this.username = '';
    this.password = '';
  }
  async login() {
    this.loginFailed = '';
    try {
      this.token = await this.userService.login(this.username, this.password);

      if (this.token.userToken) {
        localStorage.setItem('token', this.token.userToken);
        localStorage.setItem('name', this.token.user.first_name);

        this.dialogRef.close();
        window.location.reload();
      } else {
        this.loginFailed =
          this.token.msg || 'Failed to login. Please try again.';
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      this.loginFailed =
        'An unexpected error occurred. Please try again later.';
    }
  }

  openDialog(): void {
    this.dialogRef.close();
    this.dialog.open(RegisterComponent, {
      data: {
        title: 'All items ',
      },
    });
  }
  ngOnInit() {}
}
