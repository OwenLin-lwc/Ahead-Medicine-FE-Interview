import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

import * as d3 from 'd3';

@Component({
  selector: 'app-scatter-plot',
  imports: [FormsModule, MatToolbarModule, MatButtonModule],
  templateUrl: './scatter-plot.component.html',
  styleUrl: './scatter-plot.component.css',
})
export class ScatterPlotComponent implements OnInit {
  private data: any[] = [];
  private svg: any;

  private margin = { top: 20, right: 30, bottom: 40, left: 50 };
  private width = 600 - this.margin.left - this.margin.right;
  private height = 480 - this.margin.top - this.margin.bottom;

  private polygons: any[] = [];
  public drawing = false;
  private currentPolygon: any[] = [];
  currentLabel: string = ''; // 當前標籤輸入值
  labels: { name: string }[] = []; // 存儲標籤的列表

  ngOnInit(): void {
    d3.csv('CD45_pos.csv').then((data) => {
      this.data = data.map((d) => ({
        x: +d['CD45-KrO'],
        y: +d['SS INT LIN'],
      }));
      this.createSvg();
      this.drawPlot();
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

    // 添加 X 軸標籤
    this.svg
      .append('text')
      .attr('x', this.width / 2 + this.margin.left) // X 軸標籤的水平位置
      .attr('y', this.height + this.margin.top + 40) // X 軸標籤的垂直位置
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('CD45-KrO (200-1000)');

    // 添加 Y 軸
    this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(y));

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
    this.drawing = !this.drawing;

    if (!this.drawing) return;

    this.svg.on('click', (event: MouseEvent) => {
      if (!this.drawing) return;

      // 使用 d3.pointer 獲取座標值
      const [mouseX, mouseY] = d3.pointer(event, event.target); // 注意使用 this.svg.node()

      // 判斷是否在軸範圍內
      if (
        mouseX >= 0 &&
        mouseX <= this.width &&
        mouseY >= 0 &&
        mouseY <= this.height
      ) {
        this.currentPolygon.push({ x: mouseX, y: mouseY });
        this.drawPolygon();
      }
    });

    // 完成多邊形
    this.svg.on('dblclick', () => {
      if (this.currentPolygon.length > 2) {
        this.polygons.push([...this.currentPolygon]);
        this.currentPolygon = [];
        this.drawing = false;
        this.drawPolygons();
      }
    });
  }

  private drawPolygon(): void {
    this.svg.selectAll('.temp-polygon').remove();
    this.svg
      .append('polygon')
      .attr('class', 'temp-polygon')
      .attr('points', this.currentPolygon.map((d) => `${d.x},${d.y}`).join(' '))
      .style('fill', 'none')
      .style('stroke', 'blue')
      .style('stroke-width', 1.5);
  }

  private drawPolygons(): void {
    this.svg.selectAll('.polygon').remove();
    this.polygons.forEach((polygon, index) => {
      this.svg
        .append('polygon')
        .attr('class', 'polygon')
        .attr('points', polygon.map((d: any) => `${d.x},${d.y}`).join(' '))
        .style('fill', 'none')
        .style('stroke', 'blue')
        .style('stroke-width', 1.5);
    });
  }

  togglePolygons(): void {
    const polygons = this.svg.selectAll('.polygon');
    if (polygons.style('display') === 'none') {
      polygons.style('display', 'block');
    } else {
      polygons.style('display', 'none');
    }
  }
}
