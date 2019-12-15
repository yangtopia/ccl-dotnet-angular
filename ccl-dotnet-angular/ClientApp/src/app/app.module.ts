import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { QuayInfoState } from 'src/store/quayInfo.state';
import { QuayMooringInfoState } from 'src/store/quayMooringInfo.state';
import { environment } from '../environments/environment';
import { TyphoonInfoState } from '../store/typhoonInfo.state';
import { AppComponent } from './app.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
@NgModule({
  declarations: [AppComponent, ControlPanelComponent, CanvasComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([]),
    NgxsModule.forRoot(
      [TyphoonInfoState, QuayInfoState, QuayMooringInfoState],
      {
        developmentMode: !environment.production
      }
    ),
    NgxsLoggerPluginModule.forRoot({ disabled: !environment.production }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: !environment.production
    }),
    ClarityModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
