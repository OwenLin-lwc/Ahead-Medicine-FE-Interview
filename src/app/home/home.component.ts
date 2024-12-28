import { Component } from '@angular/core';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

@Component({
  selector: 'app-home',
  imports: [ScatterPlotComponent, ToolbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
