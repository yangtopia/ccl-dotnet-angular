import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import _isEmpty from 'lodash/isEmpty';

export interface TyphoonOption {
  year: string;
  tphn_spd: number;
  tphn_no: string;
  tphn_name: string;
}

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlPanelComponent {
  @Input() typhoonSpeed = 0;
  @Input() years: string[];
  @Input() typhoons: TyphoonOption[];
  @Input() schedules: string[] = [];

  @Output() yearChange = new EventEmitter<string>();
  @Output() typhoonChange = new EventEmitter<TyphoonOption>();
  @Output() scheduleChange = new EventEmitter<string>();

  changeYear(year: string): void {
    this.yearChange.emit(year);
  }

  changeTyphoon(tphn_no: string): void {
    const selectedTyphoon = this.typhoons.filter(
      typhoon => typhoon.tphn_no === tphn_no
    )[0];
    this.typhoonSpeed = selectedTyphoon.tphn_spd;
    this.typhoonChange.emit(selectedTyphoon);
  }

  changeSchdule(schedule: string): void {
    this.scheduleChange.emit(schedule);
  }
}
