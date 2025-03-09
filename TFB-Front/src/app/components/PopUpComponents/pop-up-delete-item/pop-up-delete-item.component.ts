import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pop-up-delete-item',
  templateUrl: './pop-up-delete-item.component.html',
  styleUrls: ['./pop-up-delete-item.component.css'],
})
export class PopUpDeleteItemComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopUpDeleteItemComponent>
  ) {
    console.log(data);
  }

  ngOnInit(): void {}
}
