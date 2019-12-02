import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit {

  yearOptions = ['2010', '2011', '2012'];
  typhoonOptions = ['t1', 't2'];
  scheduleOptions = ['s1', 's2'];

  constructor() { }

  ngOnInit() {
  }

}
