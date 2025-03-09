import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pop-up-order-done',
  templateUrl: './pop-up-order-done.component.html',
  styleUrls: ['./pop-up-order-done.component.css'],
})
export class PopUpOrderDoneComponent implements OnInit {
  public translation: string;
  constructor(
    public dialogRef: MatDialogRef<PopUpOrderDoneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.translation = '';
  }

  translate() {
    this.translation = 'תפתח עגלה חדשה בבקשה או אתה מתנתק מהמערכת';
  }
  English() {
    this.translation = '';
  }
  ngOnInit(): void {}
}
