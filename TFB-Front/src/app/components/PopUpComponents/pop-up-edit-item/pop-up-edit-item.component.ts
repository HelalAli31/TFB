import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pop-up-edit-item',
  templateUrl: './pop-up-edit-item.component.html',
  styleUrls: ['./pop-up-edit-item.component.css'],
  template: 'passed in {{ data.item }}',
})
export class PopUpEditItemComponent implements OnInit {
  public basePath: string;
  public amount: number;
  public step: number = 1;
  public max: number = 100;
  public unitsName: string = 'units';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopUpEditItemComponent>
  ) {
    this.basePath = '../../../assets/images/';
    this.amount = data?.amount;
    console.log(data);
    this.getStep();
  }

  getStep() {
    if (this.data.type == '6091d3f715858c0954951892') {
      this.step = 0.1;
      this.max = 10;
      this.unitsName = 'kg';
    }
  }
  SaveAmount() {
    this.dialogRef.close({
      amount: this.amount,
    });
  }

  ngOnInit(): void {}
}
