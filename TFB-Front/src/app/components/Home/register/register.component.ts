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
  public result: any = '';
  public messageServer = '';
  constructor(
    public dialogRef: MatDialogRef<RegisterComponent>,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.formBuilder.group({
      phone: ['', Validators.required],
      first_name: ['', Validators.required],
      password: ['', Validators.required],
      last_name: ['', Validators.required],
    });
  }

  async signUp() {
    if (this.getValidationValues()) {
      this.result = await this.userService.signUP(this.userForm.value);
    } else {
      alert('תמלא את כל הפרטים בבקשה');
    }
    console.log(this.result);
    this.messageServer = this.result.message;
  }

  getValidationValues() {
    let validationSuccess = true;
    for (var key in this.userForm) {
      if (this.userForm.hasOwnProperty(key)) {
        if (!this.userForm[key]?.length) validationSuccess = false;
      }
    }
    return validationSuccess;
  }
  ngOnInit(): void {}
  closeDialog() {
    this.dialogRef.close();
  }
}
