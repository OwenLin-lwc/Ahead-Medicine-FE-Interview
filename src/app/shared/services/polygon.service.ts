import { Injectable, signal, Signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PolygonItem, PolygonPosition } from '../models/polygon.model';

@Injectable({
  providedIn: 'root',
})
export class PolygonService {
  readonly csvFilename = 'CD45_pos.csv';

  private currentPolygon!: PolygonPosition[];
  private polygons = signal<PolygonItem[]>([]);

  public drawing$ = new BehaviorSubject<boolean>(false);
  public currentPolygon$ = new BehaviorSubject<PolygonPosition[]>([]);
  public updatePolygons$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.currentPolygon = [];
    const savedPolygons = localStorage.getItem('polygon');
    this.polygons.set(savedPolygons ? JSON.parse(savedPolygons) : []);
    this.updatePolygons$.next(true);
  }

  get allPolygons(): Signal<PolygonItem[]> {
    return this.polygons.asReadonly();
  }

  createPolygon(label: string): void {
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
    this.updatePolygons$.next(true);
  }

  updatePolygon(
    id: string,
    value: Partial<{
      label: string | null;
      color: string | null;
    }>
  ): void {
    this.polygons.set(
      this.polygons().map((item) => {
        if (item.id === id) {
          item.label = value.label!;
          item.color = value.color!;
        }
        return item;
      })
    );
    localStorage.setItem('polygon', JSON.stringify(this.polygons()));
    this.updatePolygons$.next(true);
  }

  copyPolygon(item: PolygonItem): void {
    const data: PolygonItem = {
      id: new Date().getTime().toString(),
      label: item.label + '-copy',
      data: item.data,
      color: item.color,
      display: item.display,
    };
    this.polygons.update((old) => [...old, data]);
    localStorage.setItem('polygon', JSON.stringify(this.polygons()));
    this.updatePolygons$.next(true);
  }

  deletePolygon(id: string): void {
    this.polygons.set(this.polygons().filter((item) => item.id !== id));
    localStorage.setItem('polygon', JSON.stringify(this.polygons()));
    this.updatePolygons$.next(true);
  }

  toggleItem(id: string): void {
    this.polygons.set(
      this.polygons().map((item) => {
        if (item.id === id) {
          item.display = !item.display;
        }
        return item;
      })
    );
    localStorage.setItem('polygon', JSON.stringify(this.polygons()));
    this.updatePolygons$.next(true);
  }

  updateCurrentPolygon(data: PolygonPosition): void {
    this.currentPolygon.push(data);
    this.currentPolygon$.next([...this.currentPolygon, data]);
  }

  clearCurrentPolygon(): void {
    this.currentPolygon = [];
    this.currentPolygon$.next([]);
    this.drawing$.next(false);
  }

  getCurrentPolygons(): PolygonPosition[] {
    return this.currentPolygon;
  }
}
