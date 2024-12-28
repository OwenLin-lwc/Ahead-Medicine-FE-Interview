import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PolygonItem } from '../../shared/models/polygon.model';

import { PolygonService } from '../../shared/services/polygon.service';

@Component({
  selector: 'app-edit-dialog',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.css',
})
export class EditDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditDialogComponent>);
  readonly data = inject<PolygonItem>(MAT_DIALOG_DATA);
  readonly form = new FormGroup({
    label: new FormControl(this.data.label, [Validators.required]),
    color: new FormControl(this.data.color, [Validators.required]),
  });

  private polygonService = inject(PolygonService);

  onCopy(): void {
    this.polygonService.copyPolygon(this.data);
    this.dialogRef.close();
  }

  onDelete(): void {
    this.polygonService.deletePolygon(this.data.id);
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.polygonService.updatePolygon(this.data.id, this.form.value);
      this.dialogRef.close();
    }
  }
}
