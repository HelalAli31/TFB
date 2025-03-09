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
  public phone: string;
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
    this.phone = '';
    this.password = '';
  }
  async login() {
    this.loginFailed = '';
    this.token = await this.userService.login(this.phone, this.password);
    this.serverMsg = this.token.msg;
    console.log('token', this.token);
    if (this.token.userToken) {
      localStorage.setItem('token', this.token.userToken); // ✅ Store token as raw string (not JSON.stringify)
      this.dialogRef.close();
      window.location.reload();
    } else this.loginFailed = this.token;
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
