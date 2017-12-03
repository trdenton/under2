import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';

import { BackgroundService } from './background.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  public numerator = "total_assessed_value";
  public denominator = "assessed_land_area";

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private bgService: BackgroundService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  public selectNumerator(value: string) {
    this.numerator = value;
    this.bgService.addNumerator(value);
  }

  public selectDenominator(value: string) {
    this.denominator = value;
    this.bgService.addDenominator(value);
  }
}

