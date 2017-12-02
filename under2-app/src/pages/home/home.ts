import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  public mapViewer: Cesium.Viewer;

  public geoJsonData: Cesium.GeoJsonDataSource;

  private container: string;

  constructor(public navCtrl: NavController) {
    this.container = "mapContainer";

  }

  public ngOnInit() {
    const imageryProv: any = new Cesium.ArcGisMapServerImageryProvider({
      url:
        "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    });
    this.mapViewer = new Cesium.Viewer(this.container);
    Cesium.GeoJsonDataSource.load('../../assets/data/sample.geojson', {
      stroke: Cesium.Color.HOTPINK,
      fill: Cesium.Color.PINK,
      strokeWidth: 3,
      markerSymbol: '?'
    })
      .then(res => {
        this.geoJsonData = res;
        
        // TODO: Do stuff with data before adding to map

        this.mapViewer.dataSources.add(this.geoJsonData);
      })
  }

}
