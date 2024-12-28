import { Injectable, signal, Signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PolygonItem, PolygonPosition } from '../models/polygon.model';

@Injectable({
  providedIn: 'root',
})
export class PolygonService {
  readonly csvFilename = 'CD45_pos.csv';
  public drawing$ = new BehaviorSubject<boolean>(false);
  private currentPolygon!: PolygonPosition[];
  public currentPolygon$ = new BehaviorSubject<PolygonPosition[]>([]);
  private polygons = signal<PolygonItem[]>([]);

  constructor() {
    this.currentPolygon = [];
    const savedPolygons = localStorage.getItem('polygon');
    this.polygons.set(savedPolygons ? JSON.parse(savedPolygons) : []);
  }

  get AllPolygons(): Signal<PolygonItem[]> {
    return this.polygons.asReadonly();
  }

  savePolygon(label: string): void {
    const data: PolygonItem = {
      id: new Date().getTime().toString(),
      label,
      data: this.currentPolygon,
      color: 'blue',
      display: true,
    };
    this.polygons.update((old) => [...old, data]);
    this.clearCurrentPolygon();
    this.drawing$.next(false);
    localStorage.setItem('polygon', JSON.stringify(this.polygons()));
  }

  updateCurrentPolygon(data: PolygonPosition): void {
    this.currentPolygon.push(data);
    this.currentPolygon$.next([...this.currentPolygon, data]);
  }

  clearCurrentPolygon(): void {
    this.currentPolygon = [];
    this.currentPolygon$.next([]);
  }

  getCurrentPolygons(): PolygonPosition[] {
    return this.currentPolygon;
  }
}
