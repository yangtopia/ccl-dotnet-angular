import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlPanelComponent {
  @Input() typhoonSpeed = 0;
  @Input() years: string[];
  @Input() typhoons: string[];
  @Input() schedules: string[] = [];

  @Output() yearChange = new EventEmitter<string>();
  @Output() typhoonChange = new EventEmitter<string>();
  @Output() scheduleChange = new EventEmitter<string>();

  changeYear(year: string): void {
    this.yearChange.emit(year);
  }

  changeTyphoon(tphn_no: string): void {
    this.typhoonChange.emit(tphn_no);
  }

  changeSchdule(schedule: string): void {
    this.scheduleChange.emit(schedule);
  }
}
