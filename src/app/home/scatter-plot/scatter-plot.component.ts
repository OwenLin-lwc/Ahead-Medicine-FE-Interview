import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import * as d3 from 'd3';
import { PolygonService } from '../../shared/services/polygon.service';
import {
  PolygonItem,
  PolygonPosition,
} from '../../shared/models/polygon.model';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-scatter-plot',
  imports: [MatListModule, MatButtonModule],
  templateUrl: './scatter-plot.component.html',
  styleUrl: './scatter-plot.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScatterPlotComponent implements OnInit {
  private data: PolygonPosition[] = [];
  private svg: any;

  private margin = { top: 20, right: 30, bottom: 40, left: 50 };
  private width = 600 - this.margin.left - this.margin.right;
  private height = 480 - this.margin.top - this.margin.bottom;

  private polygonPosition!: PolygonPosition[];

  private polygonService = inject(PolygonService);

  readonly dialog = inject(MatDialog);

  get allPolygons(): PolygonItem[] {
    return this.polygonService.allPolygons();
  }

  ngOnInit(): void {
    d3.csv(this.polygonService.csvFilename).then((data) => {
      this.data = data.map((d) => ({
        x: +d['CD45-KrO'],
        y: +d['SS INT LIN'],
      }));
      this.createSvg();
      this.drawPlot();
      this.drawPolygons();
    });

    this.polygonService.drawing$.subscribe((val) => {
      val && this.activatePolygonTool();
    });
    this.polygonService.currentPolygon$.subscribe((val) => {
      this.polygonPosition = val;
      this.drawPolygon();
    });
    this.polygonService.updatePolygons$.subscribe((val) => {
      this.drawPolygons();
    });
  }

  private createSvg(): void {
    this.svg = d3
      .select('figure#scatter')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
  }

  private drawPlot(): void {
    const x = d3
      .scaleLinear()
      .domain([200, 1000])
      .range([this.margin.left, this.width + this.margin.left]);
    const y = d3
      .scaleLinear()
      .domain([0, 1000])
      .range([this.height, this.margin.top]);

    // 添加 X 軸
    this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(x));

    // 添加 Y 軸
    this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(y));

    this.axisText();

    // 繪製散點
    this.svg
      .append('g')
      .selectAll('dot')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => x(d.x))
      .attr('cy', (d: any) => y(d.y))
      .attr('r', 2)
      .style('fill', 'gray');
  }

  activatePolygonTool(): void {
    this.svg.on('click', (event: MouseEvent) => {
      // 使用 d3.pointer 獲取座標值
      const [mouseX, mouseY] = d3.pointer(event, event.target); // 注意使用 this.svg.node()

      this.polygonService.updateCurrentPolygon({ x: mouseX, y: mouseY });
    });
  }

  private drawPolygon(): void {
    if (!this.svg) return;

    this.svg.selectAll('.temp-polygon').remove();
    this.svg
      .append('polygon')
      .attr('class', 'temp-polygon')
      .attr(
        'points',
        this.polygonService
          .getCurrentPolygons()
          .map((d) => `${d.x},${d.y}`)
          .join(' ')
      )
      .style('fill', 'none')
      .style('stroke', 'blue')
      .style('stroke-width', 1.5);
  }

  private drawPolygons(): void {
    if (!this.svg) return;

    this.svg.selectAll('.polygon').remove();
    this.svg.selectAll('text').remove();

    // 繪製 清單 多邊形
    this.polygonService
      .allPolygons()
      .filter((item) => item.display)
      .forEach((polygon, index) => {
        this.svg
          .append('polygon')
          .attr('class', 'polygon')
          .attr(
            'points',
            polygon.data.map((d: any) => `${d.x},${d.y}`).join(' ')
          )
          .style('fill', 'none')
          .style('stroke', polygon.color)
          .style('stroke-width', 1.5);

        const { x, y } = this.getLabelPosition(polygon.data);
        // 添加 標籤
        this.svg
          .append('text')
          .attr('x', x) // 標籤位置 X
          .attr('y', y) // 標籤位置 Y
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', polygon.color)
          .text(polygon.label);
      });

    this.axisText();
  }

  private axisText(): void {
    // 添加 X 軸標籤
    this.svg
      .append('text')
      .attr('x', this.width / 2 + this.margin.left) // X 軸標籤的水平位置
      .attr('y', this.height + this.margin.top + 40) // X 軸標籤的垂直位置
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('CD45-KrO (200-1000)');

    // 添加 Y 軸標籤
    this.svg
      .append('text')
      .attr('x', -(this.height / 2 + this.margin.top)) // 標籤的 X 軸位置（旋轉後成為垂直方向）
      .attr('y', this.margin.left - 40) // 標籤的 Y 軸位置
      .attr('transform', 'rotate(-90)') // 旋轉標籤
      .attr('text-anchor', 'middle') // 垂直居中
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('SS INT LIN (0-1000)');
  }

  private getLabelPosition(data: PolygonPosition[]): { x: number; y: number } {
    const x =
      (Math.max(...data.map((d) => d.x)) + Math.min(...data.map((d) => d.x))) /
      2;
    const y =
      (Math.max(...data.map((d) => d.y)) + Math.min(...data.map((d) => d.y))) /
      2;

    return { x, y };
  }

  toggleItem(id: string): void {
    this.polygonService.toggleItem(id);
  }

  editItem(item: PolygonItem): void {
    this.dialog.open(EditDialogComponent, {
      data: item,
    });
  }
}
