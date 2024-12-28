import { Component, inject, input, OnInit, output } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PolygonService } from '../../shared/services/polygon.service';

@Component({
  selector: 'app-toolbar',
  imports: [
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent implements OnInit {
  currentLabel: string = ''; // 當前標籤輸入值
  private polygonService = inject(PolygonService);
  isDrawing!: boolean;
  readonly inputLabel = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.polygonService.drawing$.subscribe((val) => (this.isDrawing = val));
  }

  start(): void {
    this.polygonService.drawing$.next(true);
  }

  save(): void {
    this.inputLabel.markAsTouched();
    !this.polygonService.getCurrentPolygons().length &&
      alert('Polygon is required');
    if (
      this.inputLabel.valid &&
      this.polygonService.getCurrentPolygons().length
    ) {
      this.polygonService.createPolygon(this.inputLabel.value!);
    }
  }

  clear(): void {
    this.polygonService.clearCurrentPolygon();
  }
}
