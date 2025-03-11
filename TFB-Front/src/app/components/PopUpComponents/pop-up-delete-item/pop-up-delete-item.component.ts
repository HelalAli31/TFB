import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pop-up-delete-item',
  templateUrl: './pop-up-delete-item.component.html',
  styleUrls: ['./pop-up-delete-item.component.css'],
})
export class PopUpDeleteItemComponent {
  constructor(
    public dialogRef: MatDialogRef<PopUpDeleteItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeDialog(confirm: boolean): void {
    this.dialogRef.close(confirm); // ✅ Return true/false based on user action
  }
}
